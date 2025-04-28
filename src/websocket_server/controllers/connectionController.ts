import { WebSocket as WsWebSocket } from 'ws';
import { connectionDB } from '../database/connections';
import { ResponseDto } from '../shared/types';
import { gameController } from './gameController';
import { gameDB } from '../database/game';
import { winnersController } from './winnersController';
import { roomDB } from '../database/room';
import { roomController } from './roomController';

class ConnectionController {
  addConnection(userId: string, ws: WsWebSocket) {
    connectionDB.addConnection(userId, ws);
  }

  removeConnectionBySocket(ws: WsWebSocket) {
    const userId = connectionDB.findUserIdBySocket(ws);
    if (userId) {
      connectionDB.removeConnectionByUserId(userId);
    }
  }

  sendMessage(response: ResponseDto, recipients: string[] | 'all') {
    const message = this.prepareMessage(response);

    if (recipients === 'all') {
      for (const ws of connectionDB.getAllConnections()) {
        if (ws.readyState === ws.OPEN) {
          ws.send(message);
        }
      }
    } else {
      for (const userId of recipients) {
        const ws = connectionDB.findSocketByUserId(userId);
        if (ws && ws.readyState === ws.OPEN) {
          ws.send(message);
        }
      }
    }
  }

  sendError(ws: WsWebSocket, message: string, code = 500) {
    ws.send(JSON.stringify({ code, message }));
  }

  private prepareMessage(response: ResponseDto) {
    return JSON.stringify({
      ...response,
      data: JSON.stringify(response.data),
    });
  }

  disconnect(ws: WsWebSocket) {
    const userId = connectionDB.findUserIdBySocket(ws) || '';
    const games = gameDB.getAllGames();
    const playerGame = games.find((game) => game.playersId.find((playerId) => playerId === userId));

    if (playerGame) {
      const winnerId = playerGame.playersId.find((playerId) => playerId !== userId);

      if (winnerId) {
        gameController.sendFinish(winnerId, [winnerId]);
        
        winnersController.updateWinners(winnerId);
        gameDB.deleteGame(playerGame.gameId);

        return;
      }
    }

    const rooms = roomDB.getRooms();
    const playerRoom = rooms.find((room) => room.roomUsers.find((user) => user.index === userId));

    if (playerRoom) {
      roomDB.deleteRooms(playerRoom.roomId);
      roomController.updateRoom();
    }

    this.removeConnectionBySocket(ws);
  } 
}

export const connectionController = new ConnectionController();
