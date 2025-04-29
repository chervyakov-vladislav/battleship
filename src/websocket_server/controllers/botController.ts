import crypto from 'node:crypto';
import { WebSocket as WsWebSocket } from 'ws';
import { connectionDB } from '../database/connections';
import { Command } from '../shared/constants';
import { connectionController } from './connectionController';
import { Game, PlayerState, ShipState } from '../shared/types';
import { gameDB } from '../database/game';
import { shipsState } from '../entities/ships';
import { Board } from '../entities/board';

class BotController {
  BOT_PREFIX = 'bot'

  initGame(ws: WsWebSocket) {
    const gameId = crypto.randomUUID();
    const userId = connectionDB.findUserIdBySocket(ws) ?? '';
    const botId = this.BOT_PREFIX + crypto.randomUUID();

    this.sendCreateGame(userId, gameId);

    const botState = this.createBotState(botId, gameId);

    const newGame: Game = {
      gameId: gameId,
      playersState: [botState],
      turnId: userId,
      playersId: [userId, botId]
    }
    
    gameDB.addGame(newGame);
  }

  private sendCreateGame(userId: string, gameId: string) {
    const data = {
      idGame: gameId,
      idPlayer: userId
    }

    connectionController.sendMessage({
      type: Command.CREATE_GAME,
      data,
      id: 0
    }, [userId])
  }

  private createBotState(botId: string, gameId: string): PlayerState {
    const MAX_SHIP_STATE = 5;
    const rendomIndex = Math.floor(Math.random() * MAX_SHIP_STATE);
    const randomShipState = JSON.parse(shipsState[rendomIndex]) as ShipState[];
    const board = new Board(botId, gameId).fillBoard(randomShipState);

    const playerState = {
      indexPlayer: botId,
      ships: randomShipState,
      board
    }

    return playerState;
  }

}

export const botController = new BotController();