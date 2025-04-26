import { Room } from '@/types/types';

class RoomDB {
  rooms: Room[] = [];

  getRooms() {
    return this.rooms;
  }
}

export const roomDB = new RoomDB();