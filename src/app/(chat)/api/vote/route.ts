import { auth } from "@/auth";
import { getVotesByChatId, voteMessage } from "@/actions/queries";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get("chatId");
  const session = await auth();
  if (!chatId) {
    return new Response("chatId is required", { status: 400 });
  }

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const votes = await getVotesByChatId({ id: chatId });
  return Response.json(votes, { status: 200 });
}

export async function PATCH(request: Request) {
  const {
    chatId,
    messageId,
    comments,
    rating,
    type,
  }: {
    chatId: string;
    messageId: string;
    comments: string;
    rating: number;
    type: "up" | "down";
  } = await request.json();

  if (!chatId || !messageId || !type) {
    return new Response("messageId and type are required", { status: 400 });
  }

  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  await voteMessage({
    chatId,
    messageId,
    comments,
    rating,
    type: type,
  });

  return new Response("Message voted", { status: 200 });
}
