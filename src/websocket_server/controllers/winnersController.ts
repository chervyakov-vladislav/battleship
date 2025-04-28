import { userDB } from '../database/user';
import { winnersDB } from '../database/winners';
import { Command } from '../shared/constants';
import { Winner } from '../shared/types';
import { connectionController } from './connectionController';

class WinnersController {
  updateWinners(winnerId: string) {
    const winner = winnersDB.findWinner(winnerId);
    const userData = userDB.findOneById(winnerId);

    if (!userData) return;

    if (!winner) {
      const newWinner: Winner = {
        name: userData.name,
        userId: userData.id,
        wins: 1
      }

      winnersDB.addWinner(newWinner);
    }  else {
      const newWinner: Winner = {
        name: winner.name,
        userId: winner.userId,
        wins: winner.wins + 1
      }

      winnersDB.updateWinner(newWinner);
    }

    this.sendUpdateWinners();
  }

  sendUpdateWinners() {
    const winners = winnersDB.getWinners();

    connectionController.sendMessage({
      type: Command.UPDATE_WINNERS,
      data: winners,
      id: 0,
    }, 'all');
  }
}

export const winnersController = new WinnersController();