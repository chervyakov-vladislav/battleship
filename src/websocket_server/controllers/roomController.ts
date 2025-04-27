import { WebSocket as WsWebSocket } from 'ws';
import { connectionDB } from '../database/connections';
import { userDB } from '../database/user';
import { roomDB } from '../database/room';
import { Command } from '../shared/constants';
import { connectionController } from './connectionController';
import { gameController } from './gameController';

class RoomController {
  createRoom(ws: WsWebSocket) {
    const userId = connectionDB.findUserIdBySocket(ws) ?? '';
    const user = userDB.findOneById(userId);

    if (!user) return;

    const isRoomExist = roomDB.getRooms().find((room) => room.roomUsers[0].index === user.id);

    if (isRoomExist) {
      connectionController.sendError(ws, 'You can create only 1 room');

      return;
    }

    const rooms = roomDB.addRoom({
      roomId: crypto.randomUUID(),
      roomUsers: [
        {
          index: user.id,
          name: user.name
        }
      ]
    });

    connectionController.sendMessage({
      type: Command.UPDATE_ROOM,
      data: rooms,
      id: 0,
    }, 'all');
  }

  updateRoom() {
    const rooms = roomDB.getRooms();

    connectionController.sendMessage({
      type: Command.UPDATE_ROOM,
      data: rooms,
      id: 0,
    }, 'all');
  }

  addUserToRoom(roomId: string, ws: WsWebSocket) {
    const userId = connectionDB.findUserIdBySocket(ws) ?? '';
    const user = userDB.findOneById(userId);
    const currentRoom = roomDB.findOneByRoomId(roomId);

    if (!currentRoom || !user) return;

    if (currentRoom.roomUsers.length > 2) {
      connectionController.sendError(ws, 'The room is already full');
      return;
    }

    const isUserInRoom = currentRoom.roomUsers.find((u) => u.name === user.name) || null;

    if (isUserInRoom) {
      connectionController.sendError(ws, 'This user is already in the room');
      return;
    }

    roomDB.addUserToRoom(roomId, { index: user.id, name: user.name });
    const newRoom = roomDB.findOneByRoomId(roomId);

    if (!newRoom) return;

    gameController.createGame(newRoom);

    roomDB.deleteRoom(roomId);

    connectionController.sendMessage({
      type: Command.UPDATE_ROOM,
      data: roomDB.getRooms(),
      id: 0,
    }, 'all');
  }
}

export const roomController = new RoomController();