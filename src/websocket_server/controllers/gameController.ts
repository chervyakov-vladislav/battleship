import crypto from 'node:crypto';
import { gameDB } from '../database/game';
import { Command, Direction, hitStatus } from '../shared/constants';
import { Game, Room, PlayerShipsData, ShipState, Position, Ship, AttackData, AttackResponse, RandomAttckData } from '../shared/types';
import { connectionController } from './connectionController';
import { Board } from '../entities/board';
import { connectionDB } from '../database/connections';
import { winnersController } from './winnersController';
import { botController } from './botController';

class GameController {
  createGame(room: Room, ownerId: string) {
    const newGameId = crypto.randomUUID();
    const playersId = room.roomUsers.map((user) => user.index);

    this.sendCreateGame(room, newGameId);

    const newGame: Game = {
      gameId: newGameId,
      playersState: [],
      turnId: ownerId,
      playersId
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
        damagedPositions: [],
        isAlive: true
      }
    })

    const board = new Board(indexPlayer, gameId).fillBoard(shipsState);
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

  handleRandomAttack(data: RandomAttckData) {
    const game = gameDB.getGame(data.gameId);

    if (!game) return;

    const enemyBoard = game.playersState.find((state) => state.indexPlayer !== data.indexPlayer)?.board;

    if (!enemyBoard) return;

    const availableCells = enemyBoard.map((row) => row.filter(({ isHit }) => !isHit)).flat();
    const randomIndex = this.getRandomInt(availableCells.length);

    const { position } = availableCells[randomIndex];

    this.handleAttack({ x: position.x, y: position.y, ...data})
  }

  getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  handleAttack(data: AttackData) {
    const position = { x: data.x, y: data.y }
    const game = gameDB.getGame(data.gameId);

    if (!game) return;

    const isSinglePlay = game.playersId.some((player) => player.startsWith(botController.BOT_PREFIX));

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
          this.sendAttackResponse(position, data.indexPlayer, [data.indexPlayer, enemyState.indexPlayer], hitStatus.KILLED);

          newShipState.positionsAround.forEach((positionAround) => {
            this.sendAttackResponse(positionAround, data.indexPlayer, [data.indexPlayer, enemyState.indexPlayer], hitStatus.MISS);
            const cell = enemyState.board[positionAround.y][positionAround.x];
            cell.isHit = true;
            gameDB.updateBoard(data.gameId, enemyState.indexPlayer, enemyState.board);
          });

          newShipState.isAlive = false;
          const enemyShips = gameDB.findPlayerShips(data.gameId, enemyState.indexPlayer);
          const isFinish = this.checkIsFinish(enemyShips);

          if (isFinish) {
            this.sendFinish(data.indexPlayer, [data.indexPlayer, enemyState.indexPlayer]);
            
            winnersController.updateWinners(data.indexPlayer);
            gameDB.deleteGame(data.gameId);
          }
        } {
          this.sendAttackResponse(position, data.indexPlayer, [data.indexPlayer, enemyState.indexPlayer], hitStatus.SHOT);
        }

        if (isSinglePlay && game.turnId.startsWith(botController.BOT_PREFIX)) {
          setTimeout(() => {
            this.handleRandomAttack({ gameId: data.gameId, indexPlayer: data.indexPlayer });
          }, 500)
          return;
        }

        this.sendCurrentTurn(data.gameId, false);
      }

    } else {
      this.sendAttackResponse(position, data.indexPlayer, [data.indexPlayer, enemyState.indexPlayer], hitStatus.MISS);
      this.sendCurrentTurn(data.gameId, true);
    }

    if (isSinglePlay && game.turnId.startsWith(botController.BOT_PREFIX)) {
      this.handleRandomAttack({ gameId: data.gameId, indexPlayer: enemyState.indexPlayer });
    }
  };

  private checkIsFinish(ships: ShipState[]) {
    return ships.every(({ isAlive }) => !isAlive);
  }

  private sendAttackResponse(position: Position, playerId: string, recipients: string[], status: AttackResponse['status']) {
    const response = {
      position,
      currentPlayer: playerId,
      status: status
    }

    connectionController.sendMessage({
      type: Command.ATTACK,
      data: response,
      id: 0
    }, recipients);
  }

  sendFinish(winnerId: string, recipients: string[]) {
    connectionController.sendMessage({
      type: Command.FINISH,
      data: { winPlayer: winnerId },
      id: 0
    }, recipients);
  }
}

export const gameController = new GameController();