import type { User, Note } from "@prisma/client";
import { v4 } from "uuid";
import pool, { prisma } from "../db.server";

export type { Note } from "@prisma/client";

export const getNote = async ({
  id,
  userId,
}: Pick<Note, "id"> & {
  userId: User["id"];
}) => {
  const client = await pool.connect();
  const result = await client.query<User>(
    `SELECT n."id",n."body",n."title" FROM "Note" as n WHERE n."id" = $1 AND n."userId" = $2 LIMIT 1;`,
    [id, userId],
  );

  console.log("getNote: ", result.rows[0]);

  client.release();
  return result.rows[0];
  /* return prisma.note.findFirst({
    select: { id: true, body: true, title: true },
    where: { id, userId },
  }); */
};

export const getNoteListItems = async ({ userId }: { userId: User["id"] }) => {
  const client = await pool.connect();
  const result = await client.query<Note>(
    `SELECT * FROM "Note" as n WHERE n."userId" = $1 ORDER BY n."updatedAt" DESC;`,
    [userId],
  );
  // ORDER BY 'updatedAt' DESC;
  console.log("getNote: ", result.rows[0]);

  client.release();
  return result.rows;
  /*  return prisma.note.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  }); */
};

export const createNote = async ({
  body,
  title,
  userId,
}: Pick<Note, "body" | "title"> & {
  userId: User["id"];
}) => {
  const client = await pool.connect();
  const result = await client.query<Note>(
    "INSERT INTO Note (id, body, title, userId) VALUES ($1, $2, $3, $4)",
    [v4(), body, title, userId],
  );

  console.log("getNote: ", result.rows[0]);

  client.release();
  return result.rows[0];
  /* return prisma.note.create({
    data: {
      title,
      body,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  }); */
};

export const deleteNote = async ({
  id,
  userId,
}: Pick<Note, "id"> & { userId: User["id"] }) => {
  const client = await pool.connect();
  const result = await client.query(
    "DELETE FROM Note WHERE id = $1 AND userId = $2",
    [id, userId],
  );
  client.release();
  return result.rows[0];
};
