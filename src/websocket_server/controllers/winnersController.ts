import { winnersDB } from '../database/winners';
import { Command } from '../shared/constants';
import { connectionController } from './connectionController';

class WinnersController {
  updateWinners() {
    const winners = winnersDB.getWinners();

    connectionController.sendMessage({
      type: Command.UPDATE_WINNERS,
      data: winners,
      id: 0,
    }, 'all');
  }
}

export const winnersController = new WinnersController();