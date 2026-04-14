import type { UserRole } from "@portal-corinthians/contracts";

export interface AuthenticatedSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
  token: string;
}
