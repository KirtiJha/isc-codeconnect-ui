"use server";

import connectDB from "@/lib/db/mongodb";
import { Message } from "@/types/types";
import { ObjectId } from "mongodb";

const db = await connectDB();

const collections = {
  users: "users",
  chats: "chats",
  messages: "messages",
  feedbacks: "feedbacks",
};

export async function testDatabaseConnection() {
  const isConnected = false;
  try {
    // Send a ping to confirm a successful connection
    await db.command({ ping: 1 });
    return !isConnected;
  } catch (e) {
    console.error(e);
    return isConnected;
  }
}

export async function getUser(email: string | null | undefined) {
  if (!email) return;
  try {
    const collection = db.collection(collections.users);
    const user =
      (await collection.findOne({
        email: email,
      })) ?? (await createUser(email));

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function createUser(email: string | null | undefined) {
  try {
    const collection = db.collection(collections.users);

    // Check if user already exists
    const existingUser = await collection.findOne({ email });
    if (existingUser) {
      return null;
    }

    const result = await collection.insertOne({
      email,
      createdAt: new Date(),
    });

    if (!result.acknowledged) {
      return null;
    }

    return {
      _id: result.insertedId,
      email,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    const collection = db.collection(collections.chats);
    const chats = await collection
      .find({
        userId: new ObjectId(id),
      })
      .sort({ lastModifiedAt: -1, createdAt: -1 })
      .toArray();

    if (!chats || chats.length === 0) {
      return [];
    }

    return chats;
  } catch (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
}

export async function saveChat({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    const collection = db.collection(collections.chats);
    const result = await collection.insertOne({
      id: id,
      title: title,
      userId: new ObjectId(userId),
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    });

    if (!result) {
      return null;
    }

    if (!result.acknowledged) {
      return null;
    }

    return {
      _id: result.insertedId,
    };
  } catch (error) {
    console.error("Error creating chats:", error);
    return [];
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const collection = db.collection(collections.chats);
    const chat = await collection.findOne({
      id: id,
    });

    if (!chat) {
      return null;
    }

    return chat;
  } catch (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    const chatsCollection = db.collection(collections.chats);
    const messagesCollection = db.collection(collections.messages);
    const feedbackCollection = db.collection(collections.feedbacks);
    const chat = await chatsCollection.deleteOne({
      id: id,
    });

    const messages = await messagesCollection.deleteMany({
      chatId: id,
    });

    const feedbacks = await feedbackCollection.deleteMany({
      chatId: id,
    });

    if (
      !chat.acknowledged ||
      !messages.acknowledged ||
      !feedbacks.acknowledged
    ) {
      return null;
    }

    return chat;
  } catch (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
}

export async function saveMessages({
  chatId,
  messages,
}: {
  chatId: string;
  messages: Array<Message>;
}) {
  try {
    const chatCollection = db.collection(collections.chats);
    await chatCollection.updateOne(
      { id: chatId },
      { $set: { lastModifiedAt: new Date() } }
    );
    const collection = db.collection(collections.messages);
    const result = await collection.insertMany(messages);

    if (!result.acknowledged) {
      return null;
    }

    return result;
  } catch (error) {
    console.error("Failed to save messages in database", error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    const collection = db.collection(collections.messages);
    const messages = await collection
      .find({
        chatId: id,
      })
      .sort({ createdAt: 1 })
      .toArray();

    if (!messages || messages.length === 0) {
      return [];
    }

    return messages;
  } catch (error) {
    console.error("Failed to get messages by chat id from database", error);
    throw error;
  }
}

export async function voteMessage({
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
}) {
  try {
    const existingVote = await db
      .collection(collections.feedbacks)
      .findOne({ messageId });

    if (existingVote) {
      return await db.collection(collections.feedbacks).updateOne(
        { messageId, chatId },
        {
          $set: {
            isUpvoted: type === "up",
            comments,
            rating,
            lastModifiedAt: new Date(),
          },
        }
      );
    }
    return await db.collection(collections.feedbacks).insertOne({
      chatId,
      messageId,
      comments,
      rating,
      createdAt: new Date(),
      lastModifiedAt: new Date(),
      isUpvoted: type === "up",
    });
  } catch (error) {
    console.error("Failed to upvote message in database", error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    const collection = db.collection(collections.feedbacks);
    const votes = await collection
      .find({
        chatId: id,
      })
      .sort({ createdAt: 1 })
      .toArray();
    return votes;
  } catch (error) {
    console.error("Failed to get votes by chat id from database", error);
    throw error;
  }
}
