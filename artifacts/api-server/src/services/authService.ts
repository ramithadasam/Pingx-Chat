import bcrypt from "bcrypt";
import { eq, or } from "drizzle-orm";
import { db, usersTable, notificationSettingsTable } from "@workspace/db";
import type { User } from "@workspace/db";
import { AppError } from "../middleware/errorHandler";
import { signToken } from "../lib/jwt";
import { isValidE164 } from "../utils/phone";

const BCRYPT_ROUNDS = 12;

export interface RegisterInput {
  phone: string;
  password: string;
  username: string;
  name: string;
}

export interface LoginInput {
  phone: string;
  password: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  if (!isValidE164(input.phone)) {
    throw new AppError(400, "invalid_phone", "Phone number must be in E.164 format, e.g. +919876543210");
  }

  const [existing] = await db
    .select({ id: usersTable.id, phone: usersTable.phone, username: usersTable.username })
    .from(usersTable)
    .where(or(eq(usersTable.phone, input.phone), eq(usersTable.username, input.username)))
    .limit(1);

  if (existing) {
    if (existing.phone === input.phone) {
      throw new AppError(409, "phone_taken", "An account with this phone number already exists");
    }
    throw new AppError(409, "username_taken", "Username is already in use");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(usersTable)
      .values({
        phone: input.phone,
        passwordHash,
        username: input.username,
        name: input.name,
        status: "online",
        lastSeenAt: new Date(),
      })
      .returning();

    if (!created) {
      throw new AppError(500, "internal_error", "Failed to create user");
    }

    await tx.insert(notificationSettingsTable).values({ userId: created.id });

    return created;
  });

  const token = signToken({ userId: user.id });

  return { user, token };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, input.phone)).limit(1);

  if (!user) {
    throw new AppError(401, "invalid_credentials", "Invalid phone number or password");
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);

  if (!valid) {
    throw new AppError(401, "invalid_credentials", "Invalid phone number or password");
  }

  await db
    .update(usersTable)
    .set({ status: "online", lastSeenAt: new Date() })
    .where(eq(usersTable.id, user.id));

  const token = signToken({ userId: user.id });

  return { user: { ...user, status: "online" }, token };
}
