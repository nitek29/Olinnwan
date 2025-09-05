export type RegisterForm = {
  username: string;
  mail: string;
  password: string;
  confirmPassword: string;
};

export type LoginForm = {
  username: string;
  password: string;
};

export type EventForm = {
  title: string;
  date: string;
  duration: number;
  max_players: number;
  area: string;
  sub_area: string;
  donjon_name?: string;
  tag_id: string;
  server_id: string;
  description?: string;
};

export type CharacterForm = {
  name: string;
  sex: string;
  level: number;
  alignment: string;
  stuff: string;
  default_character: boolean;
  breed_id: string;
  server_id: string;
};

export type UpdateUserForm = {
  username: string;
  mail: string;
  password?: string;
  confirmPassword?: string;
};
