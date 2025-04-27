import { CellState, ShipState } from '../shared/types';

export class BoardController {
  BOARD_SIZE = 10;
  gameId: string;
  playerId: string;
  board: CellState[][] = [];

  constructor(playerId: string, gameId: string) {
    this.playerId = playerId;
    this.gameId = gameId;

    for (let y = 0; y < this.BOARD_SIZE; y++) {
      const row: CellState[] = [];

      for (let x = 0; x < this.BOARD_SIZE; x++) {
        row.push({
          position: { x, y },
          hasShip: false,
          isHit: false,
          isMiss: false,
        });
      }

      this.board.push(row);
    }
  }

  fillBoard(ships: ShipState[]) {
    ships.forEach((ship) => {
      ship.allPositions.forEach((pos) => {
        this.board[pos.y][pos.x].hasShip = true;
      });
    });

    return this.board;
  };
}