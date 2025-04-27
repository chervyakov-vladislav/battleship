import { Command } from './constants';

export type ClientMessage = RegMessage | CreateRoomMessage | AddUserToRoomMessage | AddShipsMessage;

export type RouterMessage = {
  response: ResponseDto,
  recipients: string[] | 'all',
  registerUserId?: string
}

export type ResponseDto = {
  type: CommandType,
  data: UserAccountResponseDto | Room[] | Winner[] | CreateGameDto | StartGameDto | TurnDto,
  id: number
};

interface BaseMessage<T extends CommandType, D> {
  type: T;
  data: D;
  id: number;
}

type CommandType = typeof Command[keyof typeof Command];

type RegMessage = BaseMessage<'reg', UserAccount>;
type CreateRoomMessage = BaseMessage<'create_room', string>;
type AddUserToRoomMessage = BaseMessage<'add_user_to_room', { indexRoom: string }>
type AddShipsMessage = BaseMessage<'add_ships', PlayerShipsData>

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

//battleship matrix
export type Game = {
  gameId: string,  
  playersState: PlayerState[],
  turnId: string
}

type Position = {
  x: number;
  y: number;
}

type ShipType = 'small' | 'medium' | 'large' | 'huge';

type Ship = {
  position: Position;
  direction: boolean;
  type: ShipType;
  length: number;
}

export type PlayerShipsData = {
  gameId: string;
  ships: Ship[];
  indexPlayer: string;
}

export type PlayerState = Omit<PlayerShipsData, 'gameId'>;