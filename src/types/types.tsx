type JSONObject = {
  [key: string]: JSONValue;
};
type JSONArray = JSONValue[];

type JSONValue = null | string | number | boolean | JSONObject | JSONArray;

// Add the FileAttachment interface
export interface FileAttachment {
  id: string;
  name: string;
  content: string;
  type: string;
  language: string;
  extension: string;
}

export interface Message {
  /**
  A unique identifier for the message.
     */
  id?: string;
  /**
  The timestamp of the message.
     */
  createdAt?: Date;
  /**
  Text content of the message.
     */
  content: string | Array<{ type: string; text: string }>;
  /**
   * Additional attachments to be sent along with the message.
   */
  role: "system" | "user" | "assistant" | "data";
  data?: JSONValue;
  /**
   * Additional message-specific information added on the server via StreamData
   */
  annotations?: JSONValue[] | undefined;
  /* chatId for database */
  chatId?: string;
  /**
   * File attachments for the message
   */
  files?: FileAttachment[];
}

export interface ChatType {
  id: string;
  chatId: string;
  createdAt: Date;
  lastModifiedAt: Date;
  title: string;
  userId: string;
  visibility: "public" | "private";
}

export type NewChat = () => Promise<string>;

export type PrintChat = () => void;

export interface Vote {
  chatId: string;
  messageId: string;
  comments: string;
  isUpvoted: boolean;
}
