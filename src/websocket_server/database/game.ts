import { CellState, Game, PlayerState } from '../shared/types';

class GameDb {
  games: Game[] = [];

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

  updateBoard(gameId: string, playerId: string, newBoard: CellState[][]) {
    this.games = this.games.map((game) => {
      if (game.gameId === gameId) {
        const newPlayerState = game.playersState.map((state) => {
          if (state.indexPlayer === playerId) {
            state.board = newBoard;

            return state;
          };

          return state;
        })
        game.playersState = newPlayerState;
      }

      return game;
    });
  }
}

export const gameDB = new GameDb();