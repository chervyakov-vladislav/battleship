import { Command } from './constants';

export type ClientMessage = RegMessage | CreateRoomMessage | AddUserToRoomMessage | AddShipsMessage | AttackMessage | RandomAttackMessage;

export type RouterMessage = {
  response: ResponseDto,
  recipients: string[] | 'all',
  registerUserId?: string
}

export type ResponseDto = {
  type: CommandType,
  data: UserAccountResponseDto | Room[] | Winner[] | CreateGameDto | StartGameDto | TurnDto | AttackResponse,
  id: number
};

interface BaseMessage<T extends CommandType, D> {
  type: T;
  data: D;
  id: number;
}

type CommandType = typeof Command[keyof typeof Command];

type RegMessage = BaseMessage<typeof Command.REG, UserAccount>;
type CreateRoomMessage = BaseMessage<typeof Command.CREATE_ROOM, string>;
type AddUserToRoomMessage = BaseMessage<typeof Command.ADD_USER_TO_ROOM, { indexRoom: string }>
type AddShipsMessage = BaseMessage<typeof Command.ADD_SHIPS, PlayerShipsData>
type AttackMessage = BaseMessage<typeof Command.ATTACK, AttackData>
type RandomAttackMessage = BaseMessage<typeof Command.RANDOM_ATTACK, RandomAttckData>

export type UserAccount = { name: string; password: string, id: string };
export type UserAccountResponseDto = {
  name: string,
  index: string,
  error: boolean,
  errorText: string,
};

export type CreateGameDto = {
  idGame: string,
  idPlayer: string
}

type StartGameDto = {
  ships: Ship[];
  currentPlayerIndex: string;
}

type TurnDto = { currentPlayer: string }

export type RoomUser = {
  name: string;
  index: string;
}

export type Room = {
  roomId: string;
  roomUsers: RoomUser[]
}

export type Winner = {
  userId: string;
  name: string;
  wins: number;
}

export type Game = {
  gameId: string,  
  playersState: PlayerState[],
  turnId: string
}

export type Position = {
  x: number;
  y: number;
}

type ShipType = 'small' | 'medium' | 'large' | 'huge';

export type Ship = {
  position: Position;
  direction: boolean;
  type: ShipType;
  length: number;
}

export type ShipState = Ship & {
  allPositions: Position[],
  positionsAround: Position[],
  damagedPositions: Position[],
}

export type PlayerShipsData = {
  gameId: string;
  ships: Ship[];
  indexPlayer: string;
}

export type PlayerState = {
  indexPlayer: string;
  ships: ShipState[],
  board: CellState[][]
};

export type CellState = {
  position: Position;
  hasShip: boolean;
  isHit: boolean;
};

export type AttackData = {
    gameId: string,
    x: number,
    y: number,
    indexPlayer: string,
}

export type RandomAttckData = Omit<AttackData, 'x' | 'y'>

export type AttackResponse = {
    position: Position,
    currentPlayer: string
    status: "miss" | "killed" | "shot",
}