import { UserAccount } from '@/types/types';
import { userDB } from '@/database/data';

class UserController {
  regUser(user: UserAccount) {
    const existingUser = userDB.findUserByName(user.name);

    if (!existingUser) {
      const newUser = userDB.addUser(user);

      return {
        name: newUser.name,
        index: newUser.id,
        error: false,
        errorText: ''
      };
    }

    return {
      name: user.name,
      index: '',
      error: true,
      errorText: 'This user already exists'
    };
  }
}

export const userController = new UserController();