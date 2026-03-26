export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export type UpdateUserInput = Partial<Omit<CreateUserInput, "password">>;

export type UserFilter = {
  name?: string;
  email?: string;
  role?: UserRole;
  page?: number;
  limit?: number;
};
