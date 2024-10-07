import { getVoteListItems } from "@/models/vote.server";
import { requireUserId } from "@/session.server";
import { useUser } from "@/utils/utils";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const voteListItems = await getVoteListItems({ userId });

  return json({ voteListItems: voteListItems.length ? voteListItems : [] });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return request;
};

export default function Vote() {
  const data = useLoaderData<typeof loader>();
  const user = useUser();
  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to="/notes">Notes</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 px-4 py-2 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <h1>Vote</h1>
        </div>
        <div className="flex-1 p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
