import { ClientMessage, Command } from '@/types/types';
import { userController } from '../controllers/userController';

class Router {
  routeMessage(msg: ClientMessage) {
    switch (msg.type) {
      case Command.REG:
        const data = userController.regUser(msg.data);

        return {
          type: Command.REG,
          data,
          id: 0,
        }
    
      default:
        throw new Error('Invalid message type');
    }
  }
}

export const router = new Router();