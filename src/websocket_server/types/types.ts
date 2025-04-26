export type ClientMessage = {
  type: CommandType;
  data: Data;
  id: number;
}

export const Command = {
  REG: 'reg',
  somecommand: 'somecommand'
} as const;

type CommandType = typeof Command[keyof typeof Command];
type Data = UserAccount;

export type UserAccount = { name: string; password: string, id?: string }