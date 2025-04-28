import { CellState, Game, PlayerState, Position, ShipState } from '../shared/types';

class GameDb {
  games: Game[] = [];

  addGame(game: Game) {
    this.games.push(game);
  }

  deleteGame(gameId: string) {
    this.games = this.games.filter((game) => game.gameId !== gameId)
  }

  getGame(gameId: string) {
    return this.games.find((game) => game.gameId === gameId) || null;
  }

  getAllGames() {
    return this.games;
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

  findShipByPosition(gameId: string, playerId: string, position: Position) {
    const ships = this.findPlayerShips(gameId, playerId);
  
    let shipState: ShipState | null = null;
    let shipStateIndex = -1;
  
    for (let i = 0; i < ships.length; i++) {
      if (ships[i].allPositions.some((pos) => pos.x === position.x && pos.y === position.y)) {
        shipState = ships[i];
        shipStateIndex = i;
        break;
      }
    }
  
    return {
      shipState,
      shipStateIndex
    };
  }

  findPlayerShips(gameId: string, playerId: string) {
    let ships: ShipState[] = [];

    this.games.forEach((game) => {
      if (game.gameId === gameId) {
        game.playersState.forEach((state) => {
          if (state.indexPlayer === playerId) {
            ships = state.ships;
          }
        });
      };
    });

    return ships;
  }
}

export const gameDB = new GameDb();