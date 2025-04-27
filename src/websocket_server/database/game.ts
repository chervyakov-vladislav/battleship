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
    this.games = this.games.map((game) => {
      if (game.gameId === gameId) {
        if (game.playersState.length > 2) return game;

        game.playersState.push(playerState);
      }

      return game;
    });
  }

  updateTurnId(gameId: string, newTurnId: string) {
    this.games = this.games.map((game) => {
      if (game.gameId === gameId) {
        game.turnId = newTurnId;
      }

      return game;
    });
  }
}

export const gameDB = new GameDb();