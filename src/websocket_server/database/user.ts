import { UserAccount } from '../shared/types';

class UserDB {
  users: UserAccount[] = [];

  addUser(user: UserAccount) {
    const id = crypto.randomUUID();
    const newUser = {
      ...user,
      id
    }

    this.users.push(newUser);

    return newUser;
  }

  findOneById(id: string) {
    return this.users.find((user) => user.id === id) || null;
  }

  findOneByName(name: string) {
    return this.users.find((user) => user.name === name) || null;
  }
}

const userDB = new UserDB();

export {
  userDB
}