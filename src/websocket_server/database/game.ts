import { Game } from '../shared/types';

class GameDb {
  games: Game[] = []

  addGame(game: Game) {
    this.games.push(game);
  }
}

export const gameDB = new GameDb();