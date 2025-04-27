import { Winner } from '../shared/types';

class WinnersDB {
  winners: Winner[] = [];

  getWinners() {
    return this.winners;
  }
}

export const winnersDB = new WinnersDB();