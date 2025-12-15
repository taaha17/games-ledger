// ============================================
// prisma database client
// ============================================
// singleton prisma client to avoid creating too many connections
// in dev mode, we reuse the same client across hot reloads

import { PrismaClient } from "@prisma/client";

// this weird globalThis thing is to keep the prisma client around
// between hot reloads in development mode
// without this, we'd create a new connection on every code change
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// either use the existing client or create a new one
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// save the client to globalThis in dev so we can reuse it
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
