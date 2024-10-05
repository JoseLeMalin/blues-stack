import type { User, Note } from "@prisma/client";
import { v4 } from "uuid";
import pool, { prisma } from "../db.server";
import dayjs from "dayjs";

export type { Note } from "@prisma/client";

export const getNote = async ({
  id,
  userId,
}: Pick<Note, "id"> & {
  userId: User["id"];
}) => {
  const client = await pool.connect();
  const result = await client.query<Note>(
    `SELECT id,body,title FROM "Note" WHERE "id" = $1 AND "userId" = $2 LIMIT 1;`,
    [id, userId],
  );
  client.release();

  return result.rows[0];
};

export const getNoteListItems = async ({ userId }: { userId: User["id"] }) => {
  const client = await pool.connect();
  const result = await client.query<Note>(
    `SELECT id, body, title FROM "Note" WHERE "userId" = $1 ORDER BY "updatedAt" DESC;`,
    [userId],
  );
  client.release();

  return result.rows;
};

export const createNote = async ({
  body,
  title,
  userId,
}: Pick<Note, "body" | "title"> & {
  userId: User["id"];
}) => {
  const client = await pool.connect();
  const noteId = v4();
  await client.query<Note>(
    `INSERT INTO "Note" ("id", "title", "body", "createdAt", "updatedAt", "userId") VALUES ($1, $2, $3, $4, $5, $6);`,
    [noteId, title, body, dayjs().toISOString(), dayjs().toISOString(), userId],
  );
  client.release();

  return await getNote({ id: noteId, userId });
};

export const deleteNote = async ({
  id,
  userId,
}: Pick<Note, "id"> & { userId: User["id"] }) => {
  const client = await pool.connect();
  await client.query(`DELETE FROM "Note" WHERE "id" = $1 AND "userId" = $2;`, [
    id,
    userId,
  ]);
  client.release();
};
