/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import cx from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { memo, useState, useRef } from "react";
import { SparklesIcon } from "./icons";
import { Markdown } from "@/components/markdown";
import { MessageActions } from "@/components/message-actions";
import equal from "fast-deep-equal";
import { cn } from "@/lib/utils";
import { Message, Vote, FileAttachment } from "@/types/types";
import { FileText, Code, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import vscDarkPlus from "react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus";
import { Button } from "@/components/ui/button";
import useColorScheme from "@/hooks/use-color-scheme";
import { useTheme } from "next-themes";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
}) => {
  const systemColorScheme = useColorScheme();
  const { theme } = useTheme();
  let colorScheme = theme;
  if (theme === "system") {
    colorScheme = systemColorScheme;
  }
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Create a stable instance ID for this message component
  const messageInstanceId = useRef(
    `msg-${message.id || Math.random().toString(36).substring(2, 11)}`
  ).current;

  // Generate a stable dialog ID
  const dialogId = useRef(`dialog-${messageInstanceId}`).current;

  const isUser = message.role === "user";
  const hasFiles = message.files && message.files.length > 0;

  // Handle file preview
  const handleFileClick = (file: FileAttachment, e: React.MouseEvent) => {
    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();

    setPreviewFile(file);
    setPreviewOpen(true);
  };

  // Function to render file attachments
  const renderFileAttachments = () => {
    if (!hasFiles) return null;

    return (
      <div className="mt-2 mb-3 pb-3 border-b border-gray-800/30">
        <div className="text-xs text-gray-400 mb-2">Attached files:</div>
        <div className="flex flex-wrap gap-2">
          {message.files?.map((file, index) => (
            <div
              // Fixed key with stable id that doesn't change on re-renders
              key={`file-${file.id || index}-${messageInstanceId}`}
              className="group flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-800 border border-gray-800/50 text-sm"
            >
              <FileText className="h-3.5 w-3.5 text-blue-400" />
              <button
                className="text-gray-300 hover:text-white text-xs flex items-center"
                onClick={(e) => handleFileClick(file, e)}
                type="button"
              >
                {file.name}
                <span className="ml-1.5 text-xs text-gray-500">
                  {file.type}
                </span>
                <Eye className="h-3 w-3 ml-1.5 text-gray-500 hover:text-blue-400" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Generate a unique key for message actions
  const actionKey = `action-${messageInstanceId}`;

  return (
    // IMPORTANT: The main fix - give AnimatePresence a key
    <AnimatePresence key={`anim-${messageInstanceId}`}>
      <motion.div
        key={`motion-${messageInstanceId}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            "flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl",
            {
              "w-full": mode === "edit",
              "group-data-[role=user]/message:w-fit": mode !== "edit",
            }
          )}
        >
          {message.role === "assistant" && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 w-full">
            {message.content && mode === "view" && (
              <div className="flex flex-row gap-2 items-start">
                <div
                  className={cn("flex flex-col gap-4", {
                    "bg-primary text-primary-foreground px-3 py-2 rounded-xl whitespace-pre-wrap break-all":
                      message.role === "user",
                  })}
                >
                  {/* Display attached files at the top of user messages if there are any */}
                  {isUser && hasFiles && renderFileAttachments()}

                  {/* Regular message content */}
                  <Markdown>{message.content as string}</Markdown>
                </div>
              </div>
            )}

            <MessageActions
              key={actionKey}
              chatId={chatId}
              message={message}
              vote={vote}
              isLoading={isLoading}
            />
          </div>
        </div>
      </motion.div>

      {/* File preview dialog - Only render when open and has a file */}
      {previewOpen && previewFile && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen} key={dialogId}>
          <DialogContent className="sm:max-w-[70vw] max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                {previewFile?.name}
                {previewFile?.type && (
                  <span className="text-sm text-muted-foreground">
                    - {previewFile.type}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-auto flex-grow">
              <SyntaxHighlighter
                language={previewFile?.language || "plaintext"}
                style={colorScheme === "dark" ? vscDarkPlus : oneLight}
                showLineNumbers={true}
                customStyle={{
                  margin: 0,
                  borderRadius: "0.5rem",
                  padding: "1rem",
                }}
              >
                {previewFile?.content || ""}
              </SyntaxHighlighter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;
    // Add check for files
    if (!equal(prevProps.message.files, nextProps.message.files)) return false;

    return true;
  }
);

export const ThinkingMessage = () => {
  const role = "assistant";
  // Create a stable unique ID for the thinking message
  const thinkingId = useRef(
    `thinking-${Math.random().toString(36).substring(2, 11)}`
  ).current;

  return (
    <AnimatePresence key={`thinking-anim-${thinkingId}`}>
      <motion.div
        key={`thinking-motion-${thinkingId}`}
        className="w-full mx-auto max-w-3xl px-4 group/message "
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
        data-role={role}
      >
        <div
          className={cx(
            "flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl",
            {
              "group-data-[role=user]/message:bg-muted": true,
            }
          )}
        >
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            <SparklesIcon size={14} />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col gap-4 text-muted-foreground">
              <div className="relative flex size-4">
                <span className="absolute top-1/2 inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative top-1/2 inline-flex size-4 rounded-full bg-sky-500"></span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
