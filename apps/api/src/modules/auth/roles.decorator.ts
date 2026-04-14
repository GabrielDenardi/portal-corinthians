import { SetMetadata } from "@nestjs/common";

import type { UserRole } from "@portal-corinthians/contracts";

export const ROLE_METADATA_KEY = "roles";

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLE_METADATA_KEY, roles);
