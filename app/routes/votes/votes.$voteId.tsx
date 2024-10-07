import { getVoteListItems } from "@/models/vote.server";
import { requireUserId } from "@/session.server";
import { useUser } from "@/utils/utils";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);

  const noteListItems = await getVoteListItems({ userId });

  return json({ noteListItems: noteListItems.length ? noteListItems : [] });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  return request;
};

export default function Vote() {
  const data = useLoaderData<typeof loader>();
  /* const user = useUser(); */
  return (
    <div>
      <form method="post">
        <div>
          <input
            type="radio"
            id="vote1"
            name="vote1"
            value="vote1"
            defaultChecked
          />
          <label htmlFor="vote1">Vote 1</label>
        </div>
        <div>
          <input type="radio" id="vote2" name="vote2" value="vote2" />
          <label htmlFor="vote2">Vote 2</label>
        </div>
        <div>
          <input type="radio" id="vote3" name="vote3" value="vote3" />
          <label htmlFor="vote3">Vote 3</label>
        </div>
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}
