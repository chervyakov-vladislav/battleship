export type ClientMessage = RegMessage | CreateRoomMessage;

export type RouterMessage = {
  response: ResponseDto,
  recipients: string[] | 'all',
  registerUserId?: string
}

export type ResponseDto = {
  type: CommandType,
  data: UserAccountResponseDto | Room[] | Winner[],
  id: number
};

interface BaseMessage<T extends CommandType, D> {
  type: T;
  data: D;
  id: number;
}

export const Command = {
  REG: 'reg',
  CREATE_ROOM: 'create_room',
  UPDATE_ROOM: 'update_room',
  UPDATE_WINNERS: 'update_winners'
} as const;

type CommandType = typeof Command[keyof typeof Command];

type RegMessage = BaseMessage<'reg', UserAccount>;
type CreateRoomMessage = BaseMessage<'create_room', string>

export type UserAccount = { name: string; password: string, id?: string };
export type UserAccountResponseDto = {
  name: string,
  index: number | string,
  error: boolean,
  errorText: string,
};

export type Room = {
  roomId: string;
  roomOwner: string;
  roomUsers: {
    name: string;
    index: number | string;
  }[]
}

export type Winner = {
  userId: string;
  name: string;
  wins: number;
}
