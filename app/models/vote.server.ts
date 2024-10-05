import { User } from "@prisma/client";
import pool from "../db.server";
import { v4 } from "uuid";
import dayjs from "dayjs";

type Vote = {
  id: string;
  value: string;
};

export const createVote = async ({
  value,
  userId,
}: Pick<Vote, "value"> & {
  userId: User["id"];
}) => {
  const client = await pool.connect();
  const voteId = v4();
  await client.query<Vote>(
    `INSERT INTO "Note" ("id", "createdAt", "updatedAt", "userId") VALUES ($1, $2, $3, $4);`,
    [voteId, dayjs().toISOString(), dayjs().toISOString(), userId],
  );
  client.release();

  return await getVote({ id: voteId, userId });
};

export const getVote = async ({
  id,
  userId,
}: Pick<Vote, "id"> & {
  userId: User["id"];
}) => {
  const client = await pool.connect();
  const result = await client.query<Vote>(
    `SELECT id,value FROM "Vote" WHERE "id" = $1 AND "userId" = $2 LIMIT 1;`,
    [id, userId],
  );
  client.release();

  return result.rows[0];
};

export const getVoteListItems = async ({ userId }: { userId: User["id"] }) => {
  const client = await pool.connect();
  const result = await client.query<Vote>(
    `SELECT id, value FROM "Vote" WHERE "userId" = $1 ORDER BY "updatedAt" DESC;`,
    [userId],
  );
  client.release();

  return result.rows;
};
