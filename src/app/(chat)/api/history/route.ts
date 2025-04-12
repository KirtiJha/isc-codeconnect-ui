import { auth } from "@/auth";
import { getChatsByUserId, getUser } from "@/actions/queries";

export async function GET() {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await getUser(session?.user?.email);
  if (!user) {
    return Response.json([]);
  }

  // biome-ignore lint: Forbidden non-null assertion.
  const chats = await getChatsByUserId({ id: user._id.toString() });
  return Response.json(chats);
}
