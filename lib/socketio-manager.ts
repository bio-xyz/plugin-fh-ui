import { EventEmitter } from "events";
import { io, Socket } from "socket.io-client";
import { USER_NAME, SOCKET_MESSAGE_TYPE } from "./constants";
import { randomUUID } from "./utils";

export interface MessageBroadcastData {
  senderId: string;
  senderName: string;
  text: string;
  channelId: string;
  createdAt: number;
  source: string;
  name: string;
  attachments?: any[];
  thought?: string;
  actions?: string[];
  prompt?: string;
  [key: string]: any;
}

export interface MessageCompleteData {
  channelId: string;
  [key: string]: any;
}

export interface ControlMessageData {
  action: "enable_input" | "disable_input";
  target?: string;
  channelId: string;
  [key: string]: any;
}

export interface MessageDeletedData {
  messageId: string;
  channelId: string;
  [key: string]: any;
}

export interface ChannelClearedData {
  channelId: string;
  [key: string]: any;
}

export interface ChannelDeletedData {
  channelId: string;
  [key: string]: any;
}

export interface LogStreamData {
  level: number;
  time: number;
  msg: string;
  agentId?: string;
  agentName?: string;
  channelId?: string;
  [key: string]: any;
}

class SocketIOManager extends EventEmitter {
  private static instance: SocketIOManager | null = null;
  private socket: Socket | null = null;
  private isConnected = false;
  private activeChannelIds: Set<string> = new Set();
  private clientEntityId: string | null = null;
  private logStreamSubscribed = false;

  private constructor() {
    super();
  }

  static getInstance(): SocketIOManager {
    if (!SocketIOManager.instance) {
      SocketIOManager.instance = new SocketIOManager();
    }
    return SocketIOManager.instance;
  }

  static isConnected(): boolean {
    return SocketIOManager.instance?.isConnected || false;
  }

  initialize(clientEntityId: string): void {
    this.clientEntityId = clientEntityId;
    if (this.socket) return;

    const fullURL =
      typeof window !== "undefined" ? "http://localhost:3000" : "";
    this.socket = io(fullURL, {
      autoConnect: true,
      reconnection: true,
    });

    this.socket.on("connect", () => {
      this.isConnected = true;
      this.emit("connect");
    });

    this.socket.on("disconnect", (reason: string) => {
      this.isConnected = false;
      this.emit("disconnect", reason);
    });

    this.socket.on("unauthorized", (reason: string) => {
      this.emit("unauthorized", reason);
    });

    this.socket.on("messageBroadcast", (data: MessageBroadcastData) => {
      this.emit("messageBroadcast", data);
    });

    this.socket.on("messageComplete", (data: MessageCompleteData) => {
      this.emit("messageComplete", data);
    });

    this.socket.on("controlMessage", (data: ControlMessageData) => {
      this.emit("controlMessage", data);
    });

    this.socket.on("messageDeleted", (data: MessageDeletedData) => {
      this.emit("messageDeleted", data);
    });

    this.socket.on("channelCleared", (data: ChannelClearedData) => {
      this.emit("channelCleared", data);
    });

    this.socket.on("channelDeleted", (data: ChannelDeletedData) => {
      this.emit("channelDeleted", data);
    });

    this.socket.on("log_stream", (data: any) => {
      if (data.type === "log_entry" && data.payload) {
        this.emit("logStream", data.payload as LogStreamData);
      }
    });

    this.socket.on("log_subscription_confirmed", (data) => {
      this.logStreamSubscribed = data.subscribed;
    });
  }

  async joinChannel(channelId: string): Promise<void> {
    if (!this.socket) return;
    if (!this.isConnected) await new Promise((r) => this.once("connect", r));
    this.activeChannelIds.add(channelId);
    this.socket.emit("message", {
      type: SOCKET_MESSAGE_TYPE.ROOM_JOINING,
      payload: {
        channelId,
        roomId: channelId,
        entityId: this.clientEntityId,
      },
    });
  }

  leaveChannel(channelId: string): void {
    if (!this.socket) return;
    this.activeChannelIds.delete(channelId);
  }

  async sendMessage(
    message: string,
    channelId: string,
    serverId: string,
    source: string,
    attachments?: any[],
    messageId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    if (!this.socket) return;
    if (!this.isConnected) await new Promise((r) => this.once("connect", r));
    const finalMessageId = messageId || randomUUID();
    this.socket.emit("message", {
      type: SOCKET_MESSAGE_TYPE.SEND_MESSAGE,
      payload: {
        senderId: this.clientEntityId,
        senderName: USER_NAME,
        message,
        channelId,
        roomId: channelId,
        serverId,
        messageId: finalMessageId,
        source,
        attachments,
        metadata,
      },
    });
  }

  async subscribeToLogStream(): Promise<void> {
    if (!this.socket) return;
    if (!this.isConnected) await new Promise((r) => this.once("connect", r));
    this.socket.emit("subscribe_logs");
  }

  async unsubscribeFromLogStream(): Promise<void> {
    if (!this.socket) return;
    if (!this.isConnected) await new Promise((r) => this.once("connect", r));
    this.socket.emit("unsubscribe_logs");
  }

  async updateLogStreamFilters(filters: {
    agentName?: string;
    level?: string;
  }): Promise<void> {
    if (!this.socket) return;
    if (!this.isConnected) await new Promise((r) => this.once("connect", r));
    this.socket.emit("update_log_filters", filters);
  }

  isLogStreamSubscribed(): boolean {
    return this.logStreamSubscribed;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.activeChannelIds.clear();
      this.logStreamSubscribed = false;
    }
  }
}

export default SocketIOManager;
