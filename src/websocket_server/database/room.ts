import { Room, RoomUser } from '../shared/types';

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

  deleteRooms(roomId: string) {
    const [firstPlayerIndex, secondPlayerIndex] = this
      .findOneByRoomId(roomId)?.roomUsers
      .map((users) => users.index) ?? [];

    this.rooms = this.rooms.filter((room) => room.roomId !== roomId);
    this.rooms = this.rooms.filter((room) => {
      const isUserPendingInRoom = room.roomUsers.some((user) => user.index === firstPlayerIndex || user.index === secondPlayerIndex);

      return !isUserPendingInRoom;
    });
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