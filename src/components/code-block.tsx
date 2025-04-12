"use client";

import useColorScheme from "@/hooks/use-color-scheme";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
// import { useState } from "react";
import {
  // createElement,
  Prism as SyntaxHighlighter,
} from "react-syntax-highlighter";
import {
  vscDarkPlus,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

/* interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [output, setOutput] = useState<string | null>(null);
  const [pyodide, setPyodide] = useState<any>(null);
  const match = /language-(\w+)/.exec(className || "");
  const isPython = match && match[1] === "python";
  const codeContent = String(children).replace(/\n$/, "");
  const [tab, setTab] = useState<"code" | "run">("code");

  if (!inline) {
    return (
      <div className="not-prose flex flex-col">
        {tab === "code" && (
          <pre
            {...props}
            className={`text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900`}
          >
            <code className="whitespace-pre-wrap break-words">{children}</code>
          </pre>
        )}

        {tab === "run" && output && (
          <div className="text-sm w-full overflow-x-auto bg-zinc-800 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 border-t-0 rounded-b-xl text-zinc-50">
            <code>{output}</code>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }
} */

interface CodeBlockProps {
  className?: string;
  children?: React.ReactNode;
  inline?: boolean;
}
export function CodeBlock({
  className,
  children = "",
  ...rest
}: Readonly<CodeBlockProps>) {
  const systemColorScheme = useColorScheme();
  const { theme } = useTheme();
  let colorScheme = theme;
  if (theme === "system") {
    colorScheme = systemColorScheme;
  }
  const assistedTextHTML = String("<!-- Assisted by IBM Granite -->\n");
  const assistedTextJS = String("// Assisted by IBM Granite\n");
  const assistedTextCSS = String("/* Assisted by IBM Granite */\n");
  let assistedText = "";

  const match = /language-(\w+)/.exec(className ?? "");
  if (match) {
    switch (match[1]) {
      case "html":
      case "xml":
        assistedText = assistedTextHTML;
        break;
      case "css":
        assistedText = assistedTextCSS;
        break;
      case "javascript":
      case "apex":
        assistedText = assistedTextJS;
        break;
      case "lwc":
        assistedText = assistedTextHTML;
        break;
      default:
        assistedText = assistedTextJS;
    }
  }

  const [copied, setCopied] = useState(false);
  return match ? (
    <div className="relative">
      <div className="py-[6px] pl-[16px] bg-zinc-100 dark:bg-zinc-800 w-full mt-5 text-sm">
        {/* {match[1]} */}
        <div className="flex items-center justify-between">
          <span className="text-sm">{match[1]}</span>
          <button
            className="px-2 py-1 mr-2 text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(String(children));
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 2000);
            }}
          >
            <div className="flex items-center">
              {copied ? (
                <CheckIcon className="h-4 w-4 text-green-500" />
              ) : (
                <CopyIcon className="h-4 w-4 hover:text-blue-500 transition-colors" />
              )}
            </div>
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        PreTag="div"
        language={match[1].toLowerCase()}
        style={colorScheme === "dark" ? vscDarkPlus : oneLight}
        wrapLongLines={true}
        wrapLines={true}
        customStyle={{
          whiteSpace: "pre-wrap",
          margin: "0 0 0.5rem 0",
        }}
        codeTagProps={{
          style: {
            whiteSpace: "pre-wrap",
          },
        }}
        {...rest}
      >
        {assistedText + String(children)}
      </SyntaxHighlighter>
    </div>
  ) : (
    <code
      {...rest}
      className={`${className} text-sm bg-zinc-200 dark:bg-zinc-700 p-[0.2rem] text-foreground bg-background`}
    >
      {children}
    </code>
  );
}
