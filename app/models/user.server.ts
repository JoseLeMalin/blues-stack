import type { Password, User } from "@prisma/client";
import { hashPassword, verifyPassword } from "@/utils/crypto.node";
import pool from "@/db.server";
import { v4 } from "uuid";
import dayjs from "dayjs";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  /* return prisma.user.findUnique({ where: { id } }); */
  const client = await pool.connect();
  const result = await client.query<User>(
    // "SELECT id, email,createdAt,updatedAt FROM User WHERE id = $1",
    `SELECT * FROM "User" WHERE id = $1 LIMIT 1;`,
    [id],
  );

  console.log("Reaching here ?");

  client.release();

  return result.rows[0];
}

export async function getUserByEmail(email: User["email"]) {
  /* return prisma.user.findUnique({ where: { email } }); */
  const client = await pool.connect();
  const result = await client.query<User>(
    `SELECT id,email,createdAt,updatedAt FROM "User" WHERE email = $1`,
    [email],
  );

  console.log("getUserByEmail");

  client.release();

  return result;
}
export async function getUserByEmailWithPassword(email: User["email"]) {
  type test = User & {
    hash: string;
  };
  /* return prisma.user.findUnique({ where: { email } }); */
  const client = await pool.connect();
  const result = await client.query<test>(
    `SELECT u."id", u."email",u."createdAt",u."updatedAt",p."hash" FROM "User" u JOIN "Password" p ON p."userId" = u.id WHERE email = $1 LIMIT 1;`,
    [email],
  );

  console.log("getUserByEmailWithPassword: ", result.rows[0]);

  client.release();

  return result.rows[0];
}

export const createUser = async (email: User["email"], password: string) => {
  const newUserId = v4();
  const hashedPassword = await hashPassword(password);
  const client = await pool.connect();
  await client.query<User>(
    `INSERT INTO "User" (id, email, createdAt,updatedAt) VALUES ($1, $2, $3, $4)`,
    [newUserId, email, dayjs().toISOString(), dayjs().toISOString()],
  );
  await client.query<Password>(
    `INSERT INTO "Password" (hash, userId) VALUES ($1, $2)`,
    [hashedPassword, newUserId],
  );

  client.release();
  const newUser = await getUserById(newUserId);

  return newUser;
};

export async function deleteUserByEmail(email: User["email"]) {
  const client = await pool.connect();
  await client.query<User>(`DELETE FROM "User" WHERE email = $1`, [email]);
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"],
) {
  const userWithPassword = await getUserByEmailWithPassword(email);

  if (!userWithPassword || !userWithPassword.hash) return null;

  const isValid = await verifyPassword(password, userWithPassword.hash);

  if (!isValid) return null;

  const { hash: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
/* export async function verifyLogin(
  email: User["email"],
  password: Password["hash"],
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) return null;

  const isValid = await verifyPassword(
    password,
    userWithPassword.password.hash,
  );

  if (!isValid) return null;

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
} */
