import { Winner } from '@/types/types';

class WinnersDB {
  winners: Winner[] = [];

  getWinners() {
    return this.winners;
  }
}

export const winnersDB = new WinnersDB();