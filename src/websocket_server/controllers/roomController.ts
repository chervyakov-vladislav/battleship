import { WebSocket as WsWebSocket } from 'ws';
import { connectionDB } from '@/database/connections';
import { userDB } from '@/database/user';
import { roomDB } from '@/database/room';
import { Command } from '@/types/types';
import { connectionController } from './connectionController';

class RoomController {
  createRoom(ws: WsWebSocket) {
    const userId = connectionDB.findUserIdBySocket(ws) ?? '';
    const user = userDB.findOneById(userId);

    // send sequence
  }

  updateRoom() {
    const rooms = roomDB.getRooms();

    connectionController.sendMessage({
      type: Command.UPDATE_ROOM,
      data: rooms,
      id: 0,
    }, 'all');
  }
}

export const roomController = new RoomController();