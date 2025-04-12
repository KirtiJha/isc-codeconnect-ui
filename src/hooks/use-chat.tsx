import { urls } from "@/constants/constants";
import { generateUUID } from "@/lib/utils";
import { Message, FileAttachment } from "@/types/types";
import { useEffect, useState } from "react";

// Extended interface for event with files and cleaned input
interface SubmitEvent {
  preventDefault?: () => void;
  files?: FileAttachment[];
  cleanedInput?: string; // New property for cleaned input text
}

export function useChat({
  api = urls.chatQueryStream,
  id,
  userId,
  initialMessages,
  onFinish,
  onChatResetFinish,
}: {
  api: string;
  id: string;
  userId: string | undefined;
  initialMessages: Array<Message>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFinish: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChatResetFinish: any;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [input, setInput] = useState("");
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      setMessages([...initialMessages]);
    }
  }, [initialMessages]);

  const resetChat = async () => {
    try {
      const response = await fetch(urls.chatReset, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          chatId: id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // TODO: Remove new chat from here. Add new chat when new chat submission is happening
      const respNewChat = await newChat();
      return respNewChat;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
      return null;
    }
  };

  const newChat = async () => {
    try {
      const newChatId = generateUUID();
      const response = await fetch(urls.chatNew, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          chatId: newChatId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      onChatResetFinish(responseData);
      return responseData;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
      return null;
    }
  };

  // Format files for API submission - include code content in the query
  const formatFilesForAPI = (
    inputText: string,
    files: FileAttachment[]
  ): string => {
    if (!files || files.length === 0) return inputText;

    // Format uploaded files as before
    const uploadedContent = files
      .map(
        (file) =>
          `Attached ${file.type} (${file.name}):\n\`\`\`${file.language}\n${file.content}\n\`\`\`\n\n`
      )
      .join("");

    return `${inputText}\n\n${uploadedContent}`;
  };

  const handleSubmit = async (event?: SubmitEvent) => {
    event?.preventDefault?.();

    // Extract files and possibly cleaned input from event
    const files = event?.files || [];
    const hasFiles = files.length > 0;

    // Use the cleanedInput from the event if provided, otherwise use the current input state
    const messageText =
      event?.cleanedInput !== undefined ? event.cleanedInput : input;

    // Don't proceed if there's no input and no files
    if (!messageText && !hasFiles) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setStopped(false);

    // Create message content for UI display - use the cleaned input
    const messageContent = messageText;

    // Create the full message content for API with code content included
    const apiMessageContent = formatFilesForAPI(messageText, files);

    // Create user message
    const userMessage: Message = {
      id: generateUUID(),
      content: messageContent,
      role: "user",
      createdAt: new Date(),
      files: hasFiles ? files : undefined,
    };

    setMessages([...messages, userMessage]);

    // Create empty assistant message that will be filled by the stream
    const assistantMessage: Message = {
      id: generateUUID(),
      content: "",
      role: "assistant",
      createdAt: new Date(),
    };

    setInput("");

    try {
      interface ChatRequestBody {
        query: string;
        chatId: string;
        userId?: string;
        attached_files?: Array<{
          name: string;
          type: string;
          language: string;
          extension: string;
        }>;
      }

      // Prepare request body
      const requestBody: ChatRequestBody = {
        query: apiMessageContent, // Send the formatted message with code content
        chatId: id,
        userId: userId,
      };

      // Add file metadata to the request if needed
      if (hasFiles) {
        requestBody.attached_files = files.map((file) => ({
          name: file.name,
          type: file.type,
          language: file.language,
          extension: file.extension,
        }));
      }

      const response = await fetch(api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`, {
          cause: response.status,
        });
      }

      if (!api.endsWith("stream")) {
        const responseData = await response.json();
        setMessages((prevMessages) => [...prevMessages, responseData]);
      } else {
        if (!response.body) {
          throw new Error("ReadableStream not supported");
        }

        setMessages((messages) => [...messages, assistantMessage]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (stopped) {
            reader.releaseLock();
            break;
          }
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(5));
                if (data.done) {
                  break;
                }
                if (data.content) {
                  setMessages((messages) => {
                    const lastMessage = messages[messages.length - 1];
                    const updatedMessage = {
                      ...lastMessage,
                      content: lastMessage.content + data.content,
                    };
                    return [...messages.slice(0, -1), updatedMessage];
                  });
                }
              } catch (e) {
                console.error("Error parsing streaming data in use chat:", e);
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
      return null;
    } finally {
      setIsLoading(false);
      onFinish();
    }
  };

  const stop = () => {
    setStopped(true);
  };

  return {
    input,
    setInput,
    messages,
    handleSubmit,
    resetChat,
    newChat,
    isLoading,
    error,
    stop,
  };
}
