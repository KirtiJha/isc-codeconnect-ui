// import type { Message } from 'ai';
import { toast } from "sonner";
import { useSWRConfig } from "swr";

// import type { Vote } from '@/lib/db/schema';
// import { getMessageIdFromAnnotations } from '@/lib/utils';

import { CopyIcon, ThumbDownIcon, ThumbUpIcon } from "./icons";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { memo } from "react";
import equal from "fast-deep-equal";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Message, Vote } from "@/types/types";
import { useDialog } from "@/hooks/use-comment-dialog";

export function PureMessageActions({
  chatId,
  message,
  vote,
  isLoading,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
}) {
  const { mutate } = useSWRConfig();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, copyToClipboard] = useCopyToClipboard();
  const { openDialog } = useDialog();

  if (isLoading) return null;
  if (message.role === "user") return null;
  /* if (message.toolInvocations && message.toolInvocations.length > 0)
    return null; */

  const upVote = async (comments: string, rating: number) => {
    const messageId = message.id;

    const upvote = fetch("/api/vote", {
      method: "PATCH",
      body: JSON.stringify({
        chatId,
        messageId,
        comments,
        rating,
        type: "up",
      }),
    });

    toast.promise(upvote, {
      loading: "Upvoting Response...",
      success: () => {
        mutate<Array<Vote>>(
          `/api/vote?chatId=${chatId}`,
          (currentVotes) => {
            if (!currentVotes) return [];

            const votesWithoutCurrent = currentVotes.filter(
              (vote) => vote.messageId !== message.id
            );

            if (!message.id) return votesWithoutCurrent;

            return [
              ...votesWithoutCurrent,
              {
                chatId,
                messageId: message.id,
                comments,
                rating,
                isUpvoted: true,
              },
            ];
          },
          { revalidate: false }
        );

        return "Upvoted Response!";
      },
      error: "Failed to upvote response.",
    });
  };

  const downVote = async (comments: string, rating: number) => {
    const messageId = message.id;

    const downvote = fetch("/api/vote", {
      method: "PATCH",
      body: JSON.stringify({
        chatId,
        messageId,
        comments,
        rating,
        type: "down",
      }),
    });

    toast.promise(downvote, {
      loading: "Downvoting Response...",
      success: () => {
        mutate<Array<Vote>>(
          `/api/vote?chatId=${chatId}`,
          (currentVotes) => {
            if (!currentVotes) return [];

            const votesWithoutCurrent = currentVotes.filter(
              (vote) => vote.messageId !== message.id
            );

            if (!message.id) return votesWithoutCurrent;

            return [
              ...votesWithoutCurrent,
              {
                chatId,
                messageId: message.id,
                comments,
                rating,
                isUpvoted: false,
              },
            ];
          },
          { revalidate: false }
        );

        return "Downvoted Response!";
      },
      error: "Failed to downvote response.",
    });
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row gap-2">
        {
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="py-1 px-2 h-fit text-muted-foreground"
                variant="outline"
                onClick={async () => {
                  await copyToClipboard(message.content as string);
                  toast.success("Copied to clipboard!");
                }}
              >
                <CopyIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy</TooltipContent>
          </Tooltip>
        }

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
              disabled={vote?.isUpvoted}
              variant="outline"
              onClick={() => {
                openDialog(true, upVote);
              }}
            >
              <ThumbUpIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Good Response</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
              variant="outline"
              disabled={vote && !vote.isUpvoted}
              onClick={() => {
                openDialog(false, downVote);
              }}
            >
              <ThumbDownIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bad Response</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (!equal(prevProps.vote, nextProps.vote)) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    return true;
  }
);
