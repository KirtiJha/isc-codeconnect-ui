"use client";

import React from "react";
import cx from "classnames";
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  memo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useLocalStorage, useWindowSize } from "usehooks-ts";

import { ArrowUpIcon, StopIcon } from "./icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileAttachmentComponent } from "./FileAttachmentComponent";
import { FileAttachment, Message } from "@/types/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import vscDarkPlus from "react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus";
import { AlertCircle, X, FileText, Code } from "lucide-react";
import { generateUUID } from "@/lib/utils";
import useColorScheme from "@/hooks/use-color-scheme";
import { useTheme } from "next-themes";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

// Define ONLY Salesforce-specific file types
enum SalesforceFileType {
  APEX_CLASS = "Apex Class",
  APEX_TRIGGER = "Apex Trigger",
  APEX_TEST = "Apex Test Class",
  LWC_JS = "LWC JavaScript",
  LWC_HTML = "LWC HTML",
  LWC_XML = "LWC Configuration",
  LWC_CSS = "LWC CSS",
  LWC_TEST = "LWC Jest Test",
  SOQL = "SOQL Query",
  TEXT = "Text",
}

// File extension to language mapping for syntax highlighting
const fileExtensionMap: Record<string, { language: string; type: string }> = {
  // Apex
  cls: { language: "apex", type: "Apex Class" },
  trigger: { language: "apex", type: "Apex Trigger" },
  apex: { language: "apex", type: "Apex Code" },

  // Apex Test
  testcls: { language: "apex", type: "Apex Test Class" },
  apextest: { language: "apex", type: "Apex Test" },

  // LWC
  html: { language: "html", type: "LWC HTML" },
  js: { language: "javascript", type: "LWC JavaScript" },
  css: { language: "css", type: "LWC CSS" },
  xml: { language: "xml", type: "LWC Configuration" },

  // Other
  json: { language: "json", type: "JSON" },
  txt: { language: "plaintext", type: "Text" },
};

// Maximum number of attachments allowed
const MAX_ATTACHMENTS = 3;
const MAX_FILE_SIZE = 50 * 1024; // 50KB
const FILE_SIZE_DISPLAY = "50KB";

// Define the props type for PureMultimodalInput
interface PureMultimodalInputProps {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  handleSubmit: (event?: {
    preventDefault: () => void;
    files: FileAttachment[];
    cleanedInput: string;
  }) => void;
  className?: string;
}

interface MultimodalInputRef {
  processDroppedFiles: (files: File[]) => Promise<void>;
}

const PureMultimodalInput = forwardRef<
  MultimodalInputRef,
  PureMultimodalInputProps
>(
  (
    { chatId, input, setInput, isLoading, stop, handleSubmit, className },
    ref
  ) => {
    const systemColorScheme = useColorScheme();
    const { theme } = useTheme();
    let colorScheme = theme;
    if (theme === "system") {
      colorScheme = systemColorScheme;
    }
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { width } = useWindowSize();
    // Single source of truth for attachments
    const [attachments, setAttachments] = useState<FileAttachment[]>([]);
    const [error, setError] = useState("");
    const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    // Add a ref for the file input
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Set to track file names for duplicate detection (case insensitive)
    const fileNamesRef = useRef(new Set<string>());

    // Generate a unique instance ID for this component
    const instanceId = useRef(
      `multimodal-${Math.random().toString(36).substring(2, 11)}`
    ).current;

    // Standard error message for consistency
    const getMaxAttachmentsMessage = () => {
      return `Maximum ${MAX_ATTACHMENTS} attachments allowed`;
    };

    // Reset the file names set whenever attachments change
    useEffect(() => {
      // Update the fileNamesRef when attachments change
      fileNamesRef.current = new Set(
        attachments.map((file) => file.name.toLowerCase())
      );
    }, [attachments]);

    useEffect(() => {
      if (textareaRef.current) {
        adjustHeight();
      }
    }, []);

    const adjustHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${
          textareaRef.current.scrollHeight + 2
        }px`;
      }
    };

    const resetHeight = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = "98px";
      }
    };

    const [localStorageInput, setLocalStorageInput] = useLocalStorage(
      "input",
      ""
    );

    useEffect(() => {
      if (textareaRef.current) {
        const domValue = textareaRef.current.value;
        // Prefer DOM value over localStorage to handle hydration
        const finalValue = domValue ?? localStorageInput ?? "";
        setInput(finalValue);
        adjustHeight();
      }
      // Only run once after hydration
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      setLocalStorageInput(input);
    }, [input, setLocalStorageInput]);

    // Handle paste event to detect code blocks in real-time
    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      // Get the clipboard text
      const clipboardText = event.clipboardData.getData("text");

      // Only process if the clipboard text is substantial and looks like code
      if (clipboardText.length > 300 && isLikelySalesforceCode(clipboardText)) {
        // Check if adding another attachment would exceed the maximum limit
        if (attachments.length >= MAX_ATTACHMENTS) {
          event.preventDefault(); // Prevent default to avoid partial paste
          setError(getMaxAttachmentsMessage());
          return;
        }

        // Prevent default paste behavior
        event.preventDefault();

        // Get current input and cursor position
        const currentInput = input;
        const cursorPos = textareaRef.current?.selectionStart ?? 0;

        // Create a file attachment for the code
        const { language, fileType } = detectSalesforceLanguage(clipboardText);
        const fileAttachment = createSalesforceCodeAttachment(
          language,
          fileType,
          clipboardText
        );

        // Add the file attachment
        setAttachments((prev) => [...prev, fileAttachment]);
        setError(""); // Clear any error message

        // Insert the clipboard text at cursor position (for non-code)
        const newInput =
          currentInput.substring(0, cursorPos) +
          currentInput.substring(cursorPos);

        // Update the input
        setInput(newInput);

        // Focus and adjust height
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(cursorPos, cursorPos);
            adjustHeight();
          }
        }, 0);
      }
    };

    // Function to check if text is likely Salesforce code
    const isLikelySalesforceCode = (text: string): boolean => {
      // Count indented lines and lines with Salesforce code-like syntax
      const lines = text.split("\n");
      let codePatternCount = 0;
      let hasSalesforcePatterns = false;

      for (const line of lines) {
        // Check for Salesforce-specific patterns first to quickly validate
        if (
          /\b(Apex|Salesforce|SObject|@isTest|@AuraEnabled|@api|LightningElement|Account|Contact|Opportunity|Lead|trigger)\b/.test(
            line
          )
        ) {
          hasSalesforcePatterns = true;
        }

        if (
          /^\s{2,}/.test(line) || // Indentation
          /[{}();]/.test(line) || // Code symbols
          // Salesforce-specific patterns
          /\b(class|trigger|@isTest|@AuraEnabled|@api|@track|@wire|public|private|global|static|with sharing|without sharing)\b/.test(
            line
          ) ||
          /\bSystem\.\w+/.test(line) || // System class methods
          /\bApex[A-Z]\w+/.test(line) || // Apex classes
          /\bSObject\b/.test(line) || // SObject references
          /\b(Account|Contact|Opportunity|Case|Lead)\b/.test(line) || // Standard objects
          /\bLightningElement\b/.test(line) || // LWC base class
          /\bimport\s+{[^}]+}\s+from\s+['"]lightning\/\w+['"]/.test(line) || // LWC imports
          /=/.test(line) || // Assignments
          /\/\/|\/\*|\*\/|\*/.test(line) // Comments
        ) {
          codePatternCount++;
        }
      }

      // If more than 30% of non-empty lines look like code, consider it code
      const nonEmptyLines = lines.filter((l) => l.trim().length > 0).length;
      const ratio = nonEmptyLines > 0 ? codePatternCount / nonEmptyLines : 0;

      // Must have at least some Salesforce-specific patterns to be considered Salesforce code
      return hasSalesforcePatterns && ratio > 0.3 && nonEmptyLines > 5;
    };

    // Helper function to detect Salesforce-specific language and file type
    const detectSalesforceLanguage = (
      code: string
    ): { language: string; fileType: SalesforceFileType } => {
      // Check for Apex Test Class
      if (
        /@isTest|@testSetup|@testVisible|Test\.startTest\(|Test\.stopTest\(/.test(
          code
        )
      ) {
        return {
          language: "apex",
          fileType: SalesforceFileType.APEX_TEST,
        };
      }

      // Check for Apex Trigger
      if (/trigger\s+\w+\s+on\s+\w+/.test(code)) {
        return {
          language: "apex",
          fileType: SalesforceFileType.APEX_TRIGGER,
        };
      }

      // Check for Apex Class
      if (
        /(@AuraEnabled|System\.|Database\.|public\s+class|private\s+class|global\s+class|with\s+sharing|without\s+sharing)/.test(
          code
        )
      ) {
        return {
          language: "apex",
          fileType: SalesforceFileType.APEX_CLASS,
        };
      }

      // Check for LWC JavaScript
      if (
        /(import\s+{[^}]+}\s+from\s+|@api\s+|@track\s+|@wire\s+|connectedCallback\(\)|disconnectedCallback\(\)|extends\s+LightningElement)/.test(
          code
        )
      ) {
        return {
          language: "javascript",
          fileType: SalesforceFileType.LWC_JS,
        };
      }

      // Check for LWC HTML
      if (/<template>|<lightning-|<c-/.test(code)) {
        return {
          language: "html",
          fileType: SalesforceFileType.LWC_HTML,
        };
      }

      // Check for LWC XML
      if (
        /<\?xml|<LightningComponentBundle|<targetConfigs|<targets>/.test(code)
      ) {
        return {
          language: "xml",
          fileType: SalesforceFileType.LWC_XML,
        };
      }

      // Check for LWC CSS
      if (/(:host|\.slds-|\.THIS)/.test(code)) {
        return {
          language: "css",
          fileType: SalesforceFileType.LWC_CSS,
        };
      }

      // Check for LWC Tests
      if (
        /(describe\(|it\(|beforeEach\(|afterEach\(|jest\.fn\(\)|createElement\(|expect\()/.test(
          code
        )
      ) {
        return {
          language: "javascript",
          fileType: SalesforceFileType.LWC_TEST,
        };
      }

      // Check for SOQL
      if (/SELECT\s+.+\s+FROM\s+\w+/.test(code)) {
        return {
          language: "soql",
          fileType: SalesforceFileType.SOQL,
        };
      }

      // Default to Apex Class if we detect any Salesforce patterns but can't determine the specific type
      if (
        /\b(Apex|Salesforce|SObject|Account|Contact|Opportunity|Lead)\b/.test(
          code
        )
      ) {
        return {
          language: "apex",
          fileType: SalesforceFileType.APEX_CLASS,
        };
      }

      // If nothing else matches, categorize as Text
      return {
        language: "plaintext",
        fileType: SalesforceFileType.TEXT,
      };
    };

    // Helper function to create a Salesforce code attachment
    const createSalesforceCodeAttachment = (
      language: string,
      fileType: SalesforceFileType,
      content: string
    ): FileAttachment => {
      const fileExtension = getSalesforceFileExtension(language, fileType);
      const timestamp = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      return {
        id: `code_${Math.random().toString(36).substring(2, 9)}`,
        name: `code_${timestamp}${fileExtension}`,
        content,
        type: fileType,
        language,
        extension: fileExtension.substring(1), // Remove the leading dot
      };
    };

    // Helper function to get file extension based on Salesforce file type
    const getSalesforceFileExtension = (
      language: string,
      fileType: SalesforceFileType
    ): string => {
      switch (fileType) {
        case SalesforceFileType.APEX_CLASS:
        case SalesforceFileType.APEX_TEST:
          return ".cls";
        case SalesforceFileType.APEX_TRIGGER:
          return ".trigger";
        case SalesforceFileType.LWC_JS:
          return ".js";
        case SalesforceFileType.LWC_HTML:
          return ".html";
        case SalesforceFileType.LWC_XML:
          return ".xml";
        case SalesforceFileType.LWC_CSS:
          return ".css";
        case SalesforceFileType.LWC_TEST:
          return ".test.js";
        case SalesforceFileType.SOQL:
          return ".soql";
        default:
          return ".txt";
      }
    };

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.target.value);
      adjustHeight();
    };

    // Handle files read from the FileAttachmentComponent
    const onFileContentRead = (files: FileAttachment[]) => {
      if (!files || files.length === 0) return;

      // Important: We need to completely replace attachments here, not add to them
      // This prevents the duplication issue with the FileAttachmentComponent
      setAttachments(files);

      // Check if we are over the limit
      if (files.length > MAX_ATTACHMENTS) {
        setError(getMaxAttachmentsMessage());
      } else {
        setError("");
      }
    };

    // Process dropped files
    const processDroppedFiles = async (files: File[]) => {
      if (!files || files.length === 0) return;

      // Check if adding new files would exceed the limit
      if (attachments.length + files.length > MAX_ATTACHMENTS) {
        setError(
          `You can only attach up to ${MAX_ATTACHMENTS} files at a time.`
        );
        return;
      }

      // Process each file
      const newFiles: FileAttachment[] = [];
      let hasErrors = false;

      for (const file of files) {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          setError(
            `File "${file.name}" exceeds the ${FILE_SIZE_DISPLAY} size limit.`
          );
          hasErrors = true;
          continue; // Skip to the next file without processing this one
        }

        // Check for duplicate file names
        if (fileNamesRef.current.has(file.name.toLowerCase())) {
          setError(`File "${file.name}" is already attached.`);
          hasErrors = true;
          continue;
        }

        try {
          const content = await readFileContent(file);
          const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
          const fileType = detectFileType(file.name, content, extension);

          newFiles.push({
            id: generateUUID(),
            name: file.name,
            content,
            type: fileType.type,
            language: fileType.language,
            extension,
          });
        } catch (err) {
          console.error("Error reading file:", err);
          setError(`Failed to read ${file.name}. Please try again.`);
          hasErrors = true;
        }
      }

      // Only add new files if there are any valid ones
      if (newFiles.length > 0) {
        const updatedFiles = [...attachments, ...newFiles];
        setAttachments(updatedFiles);
        // Pass content to parent component
        onFileContentRead(updatedFiles);
      }

      // Auto-clear error after 5 seconds if there were no errors
      if (!hasErrors) {
        setTimeout(() => {
          setError(""); // Clear error after 5 seconds if no new errors occurred
        }, 5000);
      }
    };

    // Read file content as text
    const readFileContent = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve(event.target.result as string);
          } else {
            reject(new Error(`Error reading file: ${file.name}`));
          }
        };
        reader.onerror = () =>
          reject(new Error(`Error reading file: ${file.name}`));
        reader.readAsText(file);
      });
    };

    // Detect file type based on extension and content
    const detectFileType = (
      fileName: string,
      content: string,
      extension: string
    ) => {
      // First check by extension
      if (fileExtensionMap[extension]) {
        return fileExtensionMap[extension];
      }

      // If extension isn't recognized, try to detect by content
      if (
        content.includes("@isTest") ||
        content.includes("testMethod") ||
        fileName.includes("Test")
      ) {
        return { language: "apex", type: "Apex Test" };
      } else if (content.includes("trigger") && content.includes("on")) {
        return { language: "apex", type: "Apex Trigger" };
      } else if (content.includes("class") && content.includes("extends")) {
        return { language: "apex", type: "Apex Class" };
      } else if (content.includes("<template>") || content.includes("lwc")) {
        return { language: "html", type: "LWC HTML" };
      } else if (
        content.includes("import") &&
        content.includes("LightningElement")
      ) {
        return { language: "javascript", type: "LWC JavaScript" };
      }

      // Default to plaintext if no detection worked
      return { language: "plaintext", type: "Unknown" };
    };

    const submitForm = useCallback(
      (e?: React.FormEvent) => {
        if (e) {
          e.preventDefault();
        }

        // Don't submit if there's nothing to submit (no text and no files)
        if (!input.trim() && attachments.length === 0) {
          return;
        }

        window.history.replaceState({ id: chatId }, "", `/chat/${chatId}`);

        // Clear error message on submission
        setError("");

        // Call handleSubmit with all files
        const submitEvent = {
          preventDefault: () => {},
          files: attachments,
          cleanedInput: input, // Use the current input
        };

        handleSubmit(submitEvent);

        // Clear files after submission
        setAttachments([]);
        setLocalStorageInput("");
        resetHeight();

        if (width && width > 768) {
          textareaRef.current?.focus();
        }
      },
      [attachments, handleSubmit, setLocalStorageInput, width, chatId, input]
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        if (isLoading) {
          setError("Please wait for the model to finish its response!");
        } else {
          submitForm();
        }
      }
    };

    useImperativeHandle(ref, () => ({
      processDroppedFiles: async (files: File[]) => {
        return await processDroppedFiles(files);
      },
    }));

    return (
      <section className="relative w-full flex flex-col gap-4" key={instanceId}>
        {/* Hidden file input for keyboard accessibility */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processDroppedFiles(Array.from(e.target.files));
            }
          }}
          multiple
          accept=".cls,.trigger,.apex,.js,.html,.css,.xml,.json,.txt"
        />
        {/* File preview dialog */}
        {previewOpen && previewFile && (
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogContent className="sm:max-w-[70vw] max-h-[80vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {previewFile.name} - {previewFile.type}
                </DialogTitle>
              </DialogHeader>
              <div className="overflow-auto flex-grow">
                <SyntaxHighlighter
                  language={previewFile.language ?? "plaintext"}
                  style={colorScheme === "dark" ? vscDarkPlus : oneLight}
                  showLineNumbers={true}
                  customStyle={{
                    margin: 0,
                    borderRadius: "0.5rem",
                    padding: "1rem",
                  }}
                >
                  {previewFile.content ?? ""}
                </SyntaxHighlighter>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {/* Display attached files above the input */}
        <div
          className="px-4 py-3 dark:bg-zinc-800 text-primary-foreground rounded-lg"
          style={{
            display: attachments.length === 0 && !error ? "none" : "block",
          }}
        >
          {/* Error message if present */}
          {error && (
            <Alert
              variant="destructive"
              className="mb-3 bg-red-950/30 border-red-800 text-red-300 relative pr-8"
            >
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-400 mr-2 flex-shrink-0" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </div>
              {/* Ensure the X button is absolutely positioned to the top right corner */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0 flex items-center justify-center text-red-400 hover:text-red-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setError("");
                }}
                type="button"
                aria-label="Close error message"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </Alert>
          )}
          {/* Attached files list */}
          {attachments.length > 0 && (
            <React.Fragment>
              <div className="text-xs text-gray-400 mb-2">
                Attached files ({attachments.length}/{MAX_ATTACHMENTS}):
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file) => (
                  <div
                    key={`file-${file.id}`}
                    className="group flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1A1A2E] border border-gray-800/50 text-sm"
                  >
                    <FileText className="h-3.5 w-3.5 text-blue-400" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-gray-300 dark:hover:text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Open preview for this file
                        setPreviewFile(file);
                        setPreviewOpen(true);
                      }}
                      type="button"
                    >
                      {file.name}
                      <span className="ml-1.5 text-xs text-gray-500">
                        {file.type}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 ml-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const updatedFiles = attachments.filter(
                          (f) => f.id !== file.id
                        );
                        setAttachments(updatedFiles);
                        onFileContentRead(updatedFiles);
                      }}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </React.Fragment>
          )}
        </div>

        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder="How can I help you today?"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            className={cx(
              "min-h-[24px] max-h-[calc(75dvh)] overflow-y-auto resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700",
              className
            )}
            rows={2}
            autoFocus
            disabled={isLoading}
          />

          <div className="absolute w-full h-4 -bottom-5 flex flex-row justify-center text-xs text-muted-foreground">
            ISC-CodeConnect can make mistakes. Please verify before using the
            generated codes.
          </div>

          <div className="absolute bottom-0 left-0 p-2 flex items-center">
            {/* File attachment component */}
            <FileAttachmentComponent
              attachedFiles={attachments}
              setAttachedFiles={(files) => {
                setAttachments(files);
                if (files.length > MAX_ATTACHMENTS) {
                  setError(getMaxAttachmentsMessage());
                } else {
                  setError("");
                }
              }}
              onFileContentRead={onFileContentRead}
              setError={setError}
              instanceId={instanceId}
            />

            {/* Small file limit text next to button */}
            <span className="text-xs text-muted-foreground ml-2">
              {attachments.length}/{MAX_ATTACHMENTS} files (50KB each)
            </span>
          </div>

          <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
            {isLoading ? (
              <StopButton stop={stop} />
            ) : (
              <SendButton
                input={input}
                submitForm={submitForm}
                filesAttached={attachments.length > 0}
              />
            )}
          </div>
        </div>
      </section>
    );
  }
);

PureMultimodalInput.displayName = "PureMultimodalInput";

// Define the props type for MultimodalInput
interface MultimodalInputProps {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  messages: Message[];
  handleSubmit: (event?: {
    preventDefault: () => void;
    files: FileAttachment[];
    cleanedInput: string;
  }) => void;
  className?: string;
}

// Export the forwardRef component correctly with proper types
export const MultimodalInput = forwardRef<
  MultimodalInputRef,
  MultimodalInputProps
>(function MultimodalInput(props, ref) {
  return <PureMultimodalInput {...props} ref={ref} />;
});
MultimodalInput.displayName = "MultimodalInput";

function PureStopButton({ stop }: Readonly<{ stop: () => void }>) {
  return (
    <Button
      type="button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
      }}
    >
      <StopIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  filesAttached,
}: Readonly<{
  submitForm: (e?: React.FormEvent) => void;
  input: string;
  filesAttached: boolean;
}>) {
  return (
    <Button
      type="button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      // Enable the button if there's text input OR if files are attached
      disabled={input.length === 0 && !filesAttached}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.filesAttached !== nextProps.filesAttached) return false;
  return true;
});
