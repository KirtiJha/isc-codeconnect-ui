import { PreviewMessage, ThinkingMessage } from "@/components/message";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";
import { memo, Ref } from "react";
import equal from "fast-deep-equal";
import { Message, Vote } from "@/types/types";
import { Overview } from "@/components/overview";
import { cn } from "@/lib/utils";
import ScrollButtons from "./scroll-buttons";

interface MessagesProps {
  chatId: string;
  isLoading: boolean;
  isExporting: boolean;
  votes: Array<Vote> | undefined;
  messages: Array<Message>;
  messageContainerRef: Ref<HTMLDivElement> | undefined;
}

function PureMessages({
  chatId,
  isLoading,
  isExporting,
  votes,
  messages,
  messageContainerRef,
}: MessagesProps) {
  const [messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  return (
    <div
      ref={messageContainerRef}
      className={cn("messages flex flex-col min-w-0 gap-6 flex-1 pt-4", {
        "overflow-y-scroll": !isExporting,
      })}
    >
      {messages.length === 0 && <Overview />}

      {messages.map((message, index) => {
        // Ensure every message has a truly unique key by combining multiple unique identifiers
        const messageKey =
          message.id ||
          `msg-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

        const vote = votes
          ? votes.find((v) => v.messageId === message.id)
          : undefined;

        return (
          <PreviewMessage
            key={messageKey}
            chatId={chatId}
            message={{
              ...message,
              id: message.id || messageKey, // Preserve original ID if it exists, otherwise use our generated one
            }}
            isLoading={isLoading && messages.length - 1 === index}
            vote={vote}
          />
        );
      })}

      {isLoading &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && (
          <ThinkingMessage key={`thinking-${Date.now()}`} />
        )}

      <div
        ref={messagesEndRef}
        className="message-end shrink-0 min-w-[24px] min-h-[24px]"
      />
      <ScrollButtons targetRef={messagesEndRef} />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.isLoading && nextProps.isLoading) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});
