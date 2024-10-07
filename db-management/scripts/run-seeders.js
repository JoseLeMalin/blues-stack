import Pool from "pg";
import { randomBytes, timingSafeEqual, scrypt } from "crypto";
import { promisify } from "util";
import { v4 } from "uuid";
import dayjs from "dayjs";

// const scryptAsync = promisify<password: BinaryLike: any, salt: BinaryLike, keylen: number, callback: (err: Error | null, derivedKey: Buffer) => void>(scrypt);
const dbConfig = {
  user: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432,
  database: "postgres",
  // database: "postgresql://postgres:postgres@localhost:5432/postgres",
};

const pool = new Pool.Pool(dbConfig);
const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 32;
const KEY_LENGTH = 64;
const SCRYPT_PARAMS = {
  N: 16384, // CPU/memory cost parameter
  r: 8, // Block size parameter
  p: 1, // Parallelization parameter
};

const createDate = dayjs().toISOString();
const seed = async () => {
  const email = "rachel@remix.run";
  await pool.connect();

  // cleanup the existing database
  await deleteUserByEmail(email).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await hashPassword("123456789");

  const user = await createUser(email, hashedPassword);

  await createNote({
    body: "Hello, world!",
    title: "My first note",
    userId: user.id,
  });
  await createVote({ vote: "Like", userId: user.id });

  console.log(`Database has been seeded. 🌱`);
};

async function deleteUserByEmail(email) {
  const client = await pool.connect();
  await client.query(`DELETE FROM "User" WHERE email = $1`, [email]);
}
const hashPassword = async (password) => {
  try {
    // Generate a random salt
    const salt = randomBytes(SALT_LENGTH);

    // Hash the password with scrypt
    const derivedKey = await scryptAsync(
      password,
      salt,
      KEY_LENGTH,
      SCRYPT_PARAMS,
    );

    // Combine salt and derived key into a single buffer
    const buffer = Buffer.concat([salt, derivedKey]);

    // Return the combined value as a base64 string
    return buffer.toString("base64");
  } catch (error) {
    if (error instanceof Error)
      throw new Error(`Error hashing password: ${error.message}`);
    return String(error);
  }
};

const createUser = async (email, password) => {
  const newUserId = v4();
  const hashedPassword = await hashPassword(password);
  const client = await pool.connect();
  await client.query(
    `INSERT INTO "User" (id, email, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4)`,
    [newUserId, email, createDate, createDate],
  );
  await client.query(
    `INSERT INTO "Password" (hash, "userId") VALUES ($1, $2)`,
    [hashedPassword, newUserId],
  );

  const result = await client.query(
    `SELECT * FROM "User" as u WHERE u."id" = $1 LIMIT 1;`,
    [newUserId],
  );

  client.release();

  const newUser = result.rows[0];
  return newUser;
};

const createNote = async ({ body, title, userId }) => {
  const client = await pool.connect();
  const noteId = v4();
  await client.query(
    `INSERT INTO "Note" (id, title, body, "createdAt", "updatedAt", "userId") VALUES ($1, $2, $3, $4, $5, $6);`,
    [noteId, title, body, createDate, createDate, userId],
  );
  client.release();

  return await getNote({ id: noteId, userId });
};

const createVote = async ({ vote, userId }) => {
  const client = await pool.connect();
  const voteId = v4();
  await client.query(
    `INSERT INTO "Vote" (id, vote, "createdAt", "updatedAt", "userId") VALUES ($1, $2, $3, $4, $5);`,
    [voteId, vote, createDate, createDate, userId],
  );
  client.release();

  return await getVote({ id: voteId, userId });
};

export const getNote = async ({ id, userId }) => {
  const client = await pool.connect();
  const result = await client.query(
    `SELECT id,body,title FROM "Note" WHERE "id" = $1 AND "userId" = $2 LIMIT 1;`,
    [id, userId],
  );
  client.release();

  return result.rows[0];
};
export const getVote = async ({ id, userId }) => {
  const client = await pool.connect();
  const result = await client.query(
    `SELECT id,vote FROM "Vote" WHERE "id" = $1 AND "userId" = $2 LIMIT 1;`,
    [id, userId],
  );
  client.release();

  return result.rows[0];
};

await seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
