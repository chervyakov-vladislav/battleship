import { Command, Room } from '../types/types';
import { connectionController } from './connectionController';

class GameController {
  createGame(room: Room) {
    room.roomUsers.forEach((user) => {
      const data = {
        idGame: crypto.randomUUID(),
        idPlayer: user.index
      }

      connectionController.sendMessage({
        type: Command.CREATE_GAME,
        data,
        id: 0
      }, [user.index])

    });
  }
}

export const gameController = new GameController();