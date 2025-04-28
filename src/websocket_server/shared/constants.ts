export const Command = {
  REG: 'reg',
  CREATE_ROOM: 'create_room',
  UPDATE_ROOM: 'update_room',
  UPDATE_WINNERS: 'update_winners',
  ADD_USER_TO_ROOM: 'add_user_to_room',
  CREATE_GAME: 'create_game',
  ADD_SHIPS: 'add_ships',
  START_GAME: 'start_game',
  TURN: 'turn',
  ATTACK: 'attack',
  RANDOM_ATTACK: 'randomAttack',
} as const;

export const Direction = {
  HORIZONTAL: false,
  VERTICAL: true
} as const;

export const ShipType = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  HUGE: 'huge'
} as const;

export const hitStatus = {
  MISS: 'miss',
  SHOT: 'shot',
  KILLED: 'killed'
} as const;