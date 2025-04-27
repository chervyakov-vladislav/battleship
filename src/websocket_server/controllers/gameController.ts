import crypto from 'node:crypto';
import { gameDB } from '../database/game';
import { Command, Direction, hitStatus } from '../shared/constants';
import { Game, Room, PlayerShipsData, ShipState, Position, Ship, AttackData, AttackResponse } from '../shared/types';
import { connectionController } from './connectionController';
import { BoardController } from './boardController';
import { connectionDB } from '../database/connections';

class GameController {
  createGame(room: Room, ownerId: string) {
    const newGameId = crypto.randomUUID();

    this.sendCreateGame(room, newGameId);

    const newGame: Game = {
      gameId: newGameId,
      playersState: [],
      turnId: ownerId
    }

    gameDB.addGame(newGame);
  }

  private sendCreateGame(room: Room, gameId: string) {
    room.roomUsers.forEach((user) => {
      const data = {
        idGame: gameId,
        idPlayer: user.index
      }

      connectionController.sendMessage({
        type: Command.CREATE_GAME,
        data,
        id: 0
      }, [user.index])
    });
  }

  addPlayerShips({ indexPlayer, gameId, ships }: PlayerShipsData) {
    const shipsState: ShipState[] = ships.map((ship) => {
      const allPositions = this.calculateShipPositions(ship);
      const positionsAround = this.calculatePositionsAround(ship);

      return {
        ...ship,
        allPositions,
        positionsAround,
        damagedPositions: []
      }
    })

    const board = new BoardController(indexPlayer, gameId).fillBoard(shipsState);
    gameDB.pushPlayerState(gameId, { indexPlayer, ships: shipsState, board });

    const currentGame = gameDB.getGame(gameId);

    if (currentGame && currentGame.playersState.length === 2) {
      this.sendStartGame(currentGame);
      this.sendCurrentTurn(gameId, false);
    }
  }

  private sendStartGame(currentGame: Game) {
    currentGame.playersState.forEach((playerState) => {
      const playerData = {
        ships: playerState.ships,
        currentPlayerIndex: playerState.indexPlayer,
      }

      connectionController.sendMessage({
        type: Command.START_GAME,
        data: playerData,
        id: 0
      }, [playerState.indexPlayer])
    })
  }

  private sendCurrentTurn(gameId: string, updateTurnId: boolean) {
    const currentGame = gameDB.getGame(gameId);

    if (!currentGame) return;

    const [firstPlayerId, secondPlayerId] = currentGame.playersState.map((state) => state.indexPlayer);
    const currentTurnId = currentGame.turnId;
    const nextTurnId = currentTurnId === firstPlayerId ? secondPlayerId : firstPlayerId;
    const responce = { currentPlayer: updateTurnId ? nextTurnId : currentGame.turnId };

    connectionController.sendMessage({
      type: Command.TURN,
      data: responce,
      id: 0
    }, [firstPlayerId]);

    connectionController.sendMessage({
      type: Command.TURN,
      data: responce,
      id: 0
    }, [secondPlayerId]);

    gameDB.updateTurnId(gameId, updateTurnId ? nextTurnId : currentGame.turnId);
  }

  private calculateShipPositions({ length, direction, position }: Ship) {
    const positions = [];
  
    for (let i = 0; i < length; i++) {
      const x = direction === Direction.HORIZONTAL ? position.x + i : position.x;
      const y = direction === Direction.VERTICAL ? position.y + i : position.y;
      positions.push({ x, y });
    }
  
    return positions;
  }

  private calculatePositionsAround(ship: Ship) {
    const allPositions = this.calculateShipPositions(ship);
    const { length, direction, position } = ship;
    const around = new Map<string, Position>();

    for (let i = 0; i < length; i++) {
      const x = position.x + (direction === Direction.HORIZONTAL ? i : 0);
      const y = position.y + (direction === Direction.VERTICAL ? i : 0);

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const newX = x + dx;
          const newY = y + dy;

          if (dx === 0 && dy === 0) continue;

          if (this.isValidPosition({ x: newX, y: newY })) {
            const key = `${newX},${newY}`;
            around.set(key, { x: newX, y: newY });
          }
        }
      }
    }

    allPositions.forEach(({ x, y }) => {
      const key = `${x},${y}`;
      around.delete(key);
    });

    const positionsAround = Array.from(around.values());

    return positionsAround;
  }

  private isValidPosition(position: Position) {
    return position.x >= 0 && position.x < 10 && position.y >= 0 && position.y < 10;
  }

  handleAttack(data: AttackData) {
    const position = { x: data.x, y: data.y }
    const game = gameDB.getGame(data.gameId);

    if (!game) return;

    if (game.turnId !== data.indexPlayer) {
      const ws = connectionDB.findSocketByUserId(data.indexPlayer);

      if (ws) {
        connectionController.sendError(ws, 'Now it\'s not your turn');
        return;
      }
    }

    const enemyState = game.playersState.find((state) => state.indexPlayer !== data.indexPlayer);

    if (!enemyState) return;

    const cell = enemyState.board[data.y][data.x];
    console.log(cell);

    if (cell.isHit) {
      const ws = connectionDB.findSocketByUserId(data.indexPlayer);

      if (ws) {
        connectionController.sendError(ws, 'Wrong cell');
        return;
      }
    }

    cell.isHit = true;

    gameDB.updateBoard(data.gameId, enemyState.indexPlayer, enemyState.board);

    if (cell.hasShip) {
      const { shipState: newShipState } = gameDB.findShipByPosition(data.gameId, enemyState.indexPlayer, position);

      if (newShipState) {
        newShipState.damagedPositions.push(position);

        if (newShipState.length === newShipState.damagedPositions.length) {
          this.sendAttackResponse(position, data.indexPlayer, enemyState.indexPlayer, hitStatus.KILLED);

          newShipState.positionsAround.forEach((positionAround) => {
            this.sendAttackResponse(positionAround, data.indexPlayer, enemyState.indexPlayer, hitStatus.MISS);
            const cell = enemyState.board[positionAround.y][positionAround.x];
            cell.isHit = true;
            gameDB.updateBoard(data.gameId, enemyState.indexPlayer, enemyState.board);
          });

          // check winner state
        } {
          this.sendAttackResponse(position, data.indexPlayer, enemyState.indexPlayer, hitStatus.SHOT);
        }
        this.sendCurrentTurn(data.gameId, false);
      }

    } else {
      this.sendAttackResponse(position, data.indexPlayer, enemyState.indexPlayer, hitStatus.MISS);
      this.sendCurrentTurn(data.gameId, true);
    }
  };

  private sendAttackResponse(position: Position, playerId: string, enemyId: string, status: AttackResponse['status']) {
    const response = {
      position,
      currentPlayer: playerId,
      status: status
    }

    connectionController.sendMessage({
      type: Command.ATTACK,
      data: response,
      id: 0
    }, [playerId, enemyId]);
  }
}

export const gameController = new GameController();