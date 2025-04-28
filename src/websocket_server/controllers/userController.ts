import crypto from 'node:crypto';
import { WebSocket as WsWebSocket } from 'ws';
import { UserAccount } from '../shared/types';
import { Command } from '../shared/constants';
import { userDB } from '../database/user';
import { connectionDB } from '../database/connections';
import { connectionController } from './connectionController';
import { roomController } from './roomController';
import { winnersController } from './winnersController';

class UserController {
  regUser(user: UserAccount, ws: WsWebSocket) {
    
    const existingUser = userDB.findOneByName(user.name);
    const existingUserId = existingUser?.id ?? '';
    const userSocket = connectionDB.findSocketByUserId(existingUserId);
    const tmpConnetctionId = crypto.randomUUID();

    if (!existingUser) {
      const newUser = userDB.addUser(user);

      connectionController.addConnection(newUser.id, ws);
      connectionController.sendMessage({
        type: Command.REG,
        data: {
          name: newUser.name,
          index: newUser.id,
          error: false,
          errorText: ''
        },
        id: 0,
      }, [newUser.id]);

      roomController.updateRoom();
      winnersController.sendUpdateWinners();

      return;
    }


    if (!userSocket) {
      const isValidPassword = user.password === existingUser.password;
      
      if (isValidPassword) {
        connectionController.addConnection(existingUserId, ws);
        connectionController.sendMessage({
          type: Command.REG,
          data: {
            name: existingUser.name,
            index: existingUserId,
            error: !isValidPassword,
            errorText: ''
          },
          id: 0,
        }, [existingUserId]);
  
        roomController.updateRoom();
        winnersController.sendUpdateWinners();
  
        return;
      } else {
        connectionController.addConnection(tmpConnetctionId, ws);
        connectionController.sendMessage({
          type: Command.REG,
          data: {
            name: '',
            index: tmpConnetctionId,
            error: !isValidPassword,
            errorText: 'Invalid password'
          },
          id: 0,
        }, [tmpConnetctionId]);
        connectionController.removeConnectionBySocket(ws);

        return;
      }
    }


    connectionController.addConnection(tmpConnetctionId, ws);
    connectionController.sendMessage({
      type: Command.REG,
      data: {
        name: existingUser.name,
        index: tmpConnetctionId,
        error: true,
        errorText: 'This user already exists.'
      },
      id: 0,
    }, [tmpConnetctionId]);
    connectionController.removeConnectionBySocket(ws);
  }
}

export const userController = new UserController();
