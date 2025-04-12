"use client";

import useSWR, { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";

import { ChatHeader } from "@/components/chat-header";
import { fetcher } from "@/lib/utils";

import { MultimodalInput } from "@/components/multimodal-input";
import { Messages } from "@/components/messages";
import { useChat } from "@/hooks/use-chat";
import { urls } from "@/constants/constants";
import { useEffect, useState, useRef } from "react";
import { Message, PrintChat, Vote } from "@/types/types";
import useScreenshotScroller from "@/hooks/use-screenshot-scroller";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import Spinner from "./spinner";
import { useUserSession } from "@/hooks/use-user-session";
import { UploadIcon } from "lucide-react";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  const { mutate } = useSWRConfig();
  const { theme, systemTheme } = useTheme();
  const selectedTheme: string | undefined =
    theme !== "system" ? theme : systemTheme;

  const router = useRouter();
  const { userSession } = useUserSession();

  // Define interface for the ref
  interface MultimodalInputRef {
    processDroppedFiles: (files: File[]) => Promise<void>;
  }

  // Add ref to MultimodalInput component with correct type
  const multimodalInputRef = useRef<MultimodalInputRef>(null);

  // Add state for drag over
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const { messages, input, setInput, handleSubmit, isLoading, stop, error } =
    useChat({
      api: urls.chatQueryStream,
      id,
      userId: userSession?._id,
      initialMessages,
      onFinish: () => {
        mutate(urls.apiHistory);
      },
      onChatResetFinish: (response: {
        new_thread_id: string;
        chatId: string;
      }) => {
        console.log("chat reset finish:", response);
      },
    });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher
  );

  useEffect(() => {
    if (error?.cause === 401) {
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const { containerRef, captureAndStitchScreenshots } =
    useScreenshotScroller(selectedTheme);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const printChat: PrintChat = async () => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await captureAndStitchScreenshots();
    setIsExporting(false);
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  // Handle file drop on the chat component
  const handleFileDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Reset dragging state
    setIsDraggingOver(false);

    // Extract files from the drop event
    const items = e.dataTransfer.items;
    const files: File[] = [];

    if (items) {
      // Use DataTransferItemList interface to access the files
      for (const item of items) {
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
    } else {
      // Use DataTransfer interface to access the files
      for (const file of Array.from(e.dataTransfer.files)) {
        files.push(file);
      }
    }

    // If files were dropped and multimodalInputRef is available, process them
    if (files.length > 0 && multimodalInputRef.current) {
      multimodalInputRef.current.processDroppedFiles(files);
    }
  };

  // Handle drag over event
  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();

    // Only set dragging state if we have files
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingOver(true);
    }
  };

  // Handle drag leave event
  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();

    // Only reset if we're leaving the container (not entering a child)
    // Check if the related target is not a child of the container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingOver(false);
    }
  };

  return (
    <>
      <section
        className={cn("relative flex flex-col min-w-0 bg-background", {
          "h-dvh": !isExporting,
        })}
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        aria-label="Chat container"
      >
        <ChatHeader printChat={printChat} />

        {/* Drop zone overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20 z-10 pointer-events-none border-2 border-blue-500 border-dashed backdrop-blur-sm">
            <div className="text-blue-500 font-medium p-6 rounded-lg text-center">
              <UploadIcon className="mx-auto mb-4 text-blue-500" />
              <p className="text-lg font-medium">Drop files anywhere</p>
              <p className="text-sm text-muted-foreground">
                Files will be attached to your message
              </p>
            </div>
          </div>
        )}

        <Messages
          messageContainerRef={containerRef}
          chatId={id}
          isLoading={isLoading}
          isExporting={isExporting}
          votes={votes}
          messages={messages}
        />

        <form
          onSubmit={handleFormSubmit}
          className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl"
        >
          <MultimodalInput
            ref={multimodalInputRef}
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            messages={messages}
          />
        </form>
        {isExporting && <Spinner />}
      </section>
    </>
  );
}
