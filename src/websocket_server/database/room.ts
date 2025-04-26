import { Room, RoomUser } from '../types/types';

class RoomDB {
  rooms: Room[] = [];

  getRooms() {
    return this.rooms;
  }

  findOneByRoomId(roomId: string) {
    return this.rooms.find((room) => room.roomId === roomId) || null;
  }

  addRoom(room: Room) {
    this.rooms.push(room);

    return this.rooms;
  }

  deleteRoom(roomId: string) {
    this.rooms = this.rooms.filter((room) => room.roomId !== roomId);
  }

  addUserToRoom(roomId: string, roomUser: RoomUser) {
    const rooms = this.rooms.map((r) => {
      if (r.roomId === roomId) {
        r.roomUsers.push(roomUser)
      }

      return r;
    });

    return rooms;
  }
}

export const roomDB = new RoomDB();