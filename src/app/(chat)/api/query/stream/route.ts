import { getChatById, saveChat, saveMessages } from "@/actions/queries";
import { auth } from "@/auth";
import { generateUUID } from "@/lib/utils";
import { sendChatStream } from "@/services/chatservice";
import { Message } from "@/types/types";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  const user = (session?.user?.name ?? "").replace(/ /g, "_").toLowerCase();
  try {
    const body = await req.json();

    const query = body.query.trim();
    const chatId = body.chatId;

    const chat = await getChatById({ id: chatId });
    if (!chat) {
      await saveChat({
        id: chatId,
        userId: body.userId,
        title: query.slice(0, 40),
      });
    }

    const userMessageId = generateUUID();
    await saveMessages({
      chatId: chatId,
      messages: [
        {
          id: userMessageId,
          content: query,
          role: "user",
          chatId: chatId,
          createdAt: new Date(),
        },
      ],
    });

    const assistantMessageId = generateUUID();
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: "",
      role: "assistant",
      chatId: chatId,
      createdAt: new Date(),
    };

    const responseMessage: string[] = [];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const onChunk = (
          done: boolean,
          value: Uint8Array<ArrayBufferLike> | undefined
        ) => {
          if (!controller.desiredSize) {
            return;
          }
          const decoder = new TextDecoder("utf-8");
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(5));
                if (data.done) {
                  controller.close();
                  break;
                }
                if (data.content) {
                  const jsonData = JSON.stringify({
                    content: data.content,
                    done,
                  });
                  responseMessage.push(data.content);
                  controller.enqueue(encoder.encode(`data: ${jsonData}\n\n`));
                }
              } catch (e) {
                console.error("Error parsing streaming data:", e);
              }
            }
          }
        };
        await sendChatStream(body.query, chatId, user, onChunk);

        await saveMessages({
          chatId: chatId,
          messages: [
            {
              ...assistantMessage,
              content: responseMessage.join(""),
            },
          ],
        });
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Failed to get AI response:", error);
    return Response.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
