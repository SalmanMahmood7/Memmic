import { User, Role } from "@prisma/client";

export type CurrentUser = User & { role: Role };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      currentUser?: CurrentUser;
    }
  }
}

export {};
