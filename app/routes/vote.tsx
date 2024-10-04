import { ActionFunctionArgs } from "@remix-run/node";

export const action = async ({ request }: ActionFunctionArgs) => {

    console.log("Test vote action");
    return request
}

export default function Vote() {
  return (
    <div>
      <h1>Vote</h1>
      <form method="post">
        <div>
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
        </div>
      </form>
    </div>
  );
}
