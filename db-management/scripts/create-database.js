import Pool from "pg";

const createDatabase = async () => {
  console.log("Start creating database");
  const dbConfig = {
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "postgres",
    // database: "postgresql://postgres:postgres@localhost:5432/postgres",
  };

  const pool = new Pool.Pool(dbConfig);
  /*  CreateTable */
  const createTableUser = `CREATE TABLE "User" (
      "id" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
  
      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
  );`;

  /* CreateTable */
  const createTablePassword = `CREATE TABLE "Password" (
      "hash" TEXT NOT NULL,
      "userId" TEXT NOT NULL
  );`;

  /* CreateTable */
  const createTableNote = `CREATE TABLE "Note" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      "userId" TEXT NOT NULL,
  
      CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
  );`;

  const createTableVote = `CREATE TABLE "Vote" (
      "id" TEXT NOT NULL,
      "vote" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      "userId" TEXT NOT NULL,
  
      CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
  );`;

  /* CreateIndex */
  const createIndexUserEmail = `CREATE UNIQUE INDEX "User_email_key" ON "User"("email");`;
  /* CreateIndex */
  const createIndexuserIdPassword = `CREATE UNIQUE INDEX "Password_userId_key" ON "Password"("userId");`;

  /* AddForeignKey */
  const createFKPasswordUserId = `ALTER TABLE "Password" ADD CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`;
  /* AddForeignKey */
  const createFKNoteUserId = `ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`;
  /* AddForeignKey */
  const createFKVoteUserId = `ALTER TABLE "Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(createTableUser);
    await client.query(createTablePassword);
    await client.query(createTableNote);
    await client.query(createTableVote);
    await client.query(createIndexUserEmail);
    await client.query(createIndexuserIdPassword);
    await client.query(createFKPasswordUserId);
    await client.query(createFKNoteUserId);
    await client.query(createFKVoteUserId);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    pool.end();
  }
};

await createDatabase();
