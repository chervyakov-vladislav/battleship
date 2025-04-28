import { Winner } from '../shared/types';

class WinnersDB {
  winners: Winner[] = [];

  getWinners() {
    return this.winners;
  }

  findWinner(winnerId: string) {
    return this.winners.find((winner) => winner.userId === winnerId) || null;
  }

  updateWinner(winnerData: Winner) {
    this.winners = this.winners.map((winner) => winnerData.userId === winner.userId ? winnerData : winner);
  }

  addWinner(winnerData: Winner) {
    this.winners.push(winnerData);
  }
}

export const winnersDB = new WinnersDB();