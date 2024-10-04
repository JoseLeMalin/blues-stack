import client from "../db.server";
export async function postVote(vote: string) {
  // const session = await getSession(request);
  /* await client.connect();
  await client.query("INSERT INTO votes (vote) VALUES ($1)", [vote]);
  await client.end(); */
  return "voted";
}
