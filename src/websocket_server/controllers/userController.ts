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
    const tmpConnetctionId = crypto.randomUUID();
    const validationMessage = this.validation(user);

    if (validationMessage) {
      connectionController.addConnection(tmpConnetctionId, ws);
        connectionController.sendMessage({
          type: Command.REG,
          data: {
            name: '',
            index: tmpConnetctionId,
            error: true,
            errorText: validationMessage
          },
          id: 0,
        }, [tmpConnetctionId]);
        connectionController.removeConnectionBySocket(ws);

      return;
    }

    const existingUser = userDB.findOneByName(user.name);
    const existingUserId = existingUser?.id ?? '';
    const userSocket = connectionDB.findSocketByUserId(existingUserId);

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

  validation(user: UserAccount) {
    const login = user.name.trim();
    const password = user.password.trim()

    if (!/^[a-zA-Z0-9]{4,20}$/.test(login)) {
      return 'Login error: Only Latin letters and numbers are allowed'
    }

    if (!/[A-Za-z]/.test(login)) {
      return 'Password error: Must contain at least one Latin letter';
    }
  
    if (!/\d/.test(password)) {
      return 'Password error: Must contain at least one number';
    }

    return null;
  }
}

export const userController = new UserController();
