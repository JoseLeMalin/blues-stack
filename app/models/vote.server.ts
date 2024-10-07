import { User } from "@prisma/client";
import pool from "../db.server";
import { v4 } from "uuid";
import dayjs from "dayjs";

type Vote = {
  id: string;
  vote: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export const createVote = async ({
  vote,
  userId,
}: Pick<Vote, "vote"> & {
  userId: User["id"];
}) => {
  const client = await pool.connect();
  const voteId = v4();
  await client.query<Vote>(
    `INSERT INTO "Vote" (id, vote, "createdAt", "updatedAt", "userId") VALUES ($1, $2, $3, $4, $5);`,
    [voteId, vote, dayjs().toISOString(), dayjs().toISOString(), userId],
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
    `SELECT id,vote FROM "Vote" WHERE "id" = $1 AND "userId" = $2 LIMIT 1;`,
    [id, userId],
  );
  client.release();

  return result.rows[0];
};

export const getVoteListItems = async ({ userId }: { userId: User["id"] }) => {
  const client = await pool.connect();
  const result = await client.query<Vote>(
    `SELECT id, vote FROM "Vote" WHERE "userId" = $1 ORDER BY "updatedAt" DESC;`,
    [userId],
  );
  client.release();

  return result.rows;
};
