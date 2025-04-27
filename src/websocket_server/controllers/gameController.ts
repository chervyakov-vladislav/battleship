import crypto from 'node:crypto';
import { gameDB } from '../database/game';
import { Command } from '../shared/constants';
import { Game, Room, PlayerShipsData } from '../shared/types';
import { connectionController } from './connectionController';

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
    gameDB.pushPlayerState(gameId, { indexPlayer, ships });

    const currentGame = gameDB.getGame(gameId);

    if (currentGame && currentGame.playersState.length === 2) {
      this.sendStartGame(currentGame);
      this.sendCurrentTurn(gameId);
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

  private sendCurrentTurn(gameId: string) {
    const currentGame = gameDB.getGame(gameId);

    const currentPlayersId = currentGame?.playersState.map((player) => {
      const playerId = player.indexPlayer;

      connectionController.sendMessage({
        type: Command.TURN,
        data: { currentPlayer: currentGame.turnId },
        id: 0
      }, [playerId]);

      return playerId;
    }) || [];

    const nextTurnId = currentPlayersId.find((indexPlayer) => indexPlayer !== currentGame?.turnId) || '';

    gameDB.updateTurnId(gameId, nextTurnId);
  }
}

export const gameController = new GameController();