import { Game, PlayerState } from '../shared/types';

class GameDb {
  games: Game[] = []

  addGame(game: Game) {
    this.games.push(game);
  }

  getGame(gameId: string) {
    return this.games.find((game) => game.gameId === gameId) || null;
  }

  pushPlayerState(gameId: string, playerState: PlayerState) {
    this.games.forEach((game) => {
      if (game.gameId === gameId) {
        if (game.playersState.length > 2) return;

        game.playersState.push(playerState);
      }
    });
  }
}

export const gameDB = new GameDb();