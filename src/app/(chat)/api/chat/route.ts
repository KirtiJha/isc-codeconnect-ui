import { deleteChatById, getChatById, getUser } from "@/actions/queries";
import { auth } from "@/auth";
import { ChatType } from "@/types/types";

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chat: ChatType | any = await getChatById({ id });

    const user = await getUser(session.user.email);

    if (chat && user && chat?.userId.toString() !== user._id.toString()) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response(
      "An error occurred while processing your request: " +
        JSON.stringify(error),
      {
        status: 500,
      }
    );
  }
}
