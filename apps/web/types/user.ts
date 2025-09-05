export type User = {
  id: string;
  username: string;
  role: string;
};

export type AuthUser = User & {
  password: string;
  mail: string;
};
