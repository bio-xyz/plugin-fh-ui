"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Thread,
  Message,
  ChatContextType,
  AVAILABLE_MODELS,
} from "../types/chat";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  // State
  const [currentThread, setCurrentThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    AVAILABLE_MODELS[0]?.id || "gpt-4"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Load data from localStorage on mount
  useEffect(() => {
    const storedThreads = localStorage.getItem("t3-chat-threads");
    const storedCurrentThread = localStorage.getItem("t3-chat-current-thread");
    const storedMessages = localStorage.getItem("t3-chat-messages");
    const storedModel = localStorage.getItem("t3-chat-selected-model");

    if (storedThreads) {
      const parsedThreads = JSON.parse(storedThreads).map((thread: any) => ({
        ...thread,
        createdAt: new Date(thread.createdAt),
        updatedAt: new Date(thread.updatedAt),
      }));
      setThreads(parsedThreads);
    }

    if (storedCurrentThread) {
      const parsedThread = JSON.parse(storedCurrentThread);
      setCurrentThread({
        ...parsedThread,
        createdAt: new Date(parsedThread.createdAt),
        updatedAt: new Date(parsedThread.updatedAt),
      });
    }

    if (storedMessages) {
      const parsedMessages = JSON.parse(storedMessages).map((message: any) => ({
        ...message,
        createdAt: new Date(message.createdAt),
      }));
      setMessages(parsedMessages);
    }

    if (storedModel) {
      setSelectedModel(storedModel);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem("t3-chat-threads", JSON.stringify(threads));
  }, [threads]);

  useEffect(() => {
    if (currentThread) {
      localStorage.setItem(
        "t3-chat-current-thread",
        JSON.stringify(currentThread)
      );
    }
  }, [currentThread]);

  useEffect(() => {
    localStorage.setItem("t3-chat-messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("t3-chat-selected-model", selectedModel);
  }, [selectedModel]);

  // Create new thread
  const createNewThread = useCallback(() => {
    const newThread: Thread = {
      id: uuidv4(),
      userId: "current-user", // Will be replaced with actual user ID from Privy
      title: "New Chat",
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
    };

    setThreads((prev) => [newThread, ...prev]);
    setCurrentThread(newThread);
    setMessages([]);
  }, []);

  // Switch to existing thread
  const switchThread = useCallback(
    (threadId: string) => {
      const thread = threads.find((t) => t.id === threadId);
      if (thread) {
        setCurrentThread(thread);
        // Load messages for this thread from localStorage
        const storedMessages = localStorage.getItem(
          `t3-chat-messages-${threadId}`
        );
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages).map(
            (message: any) => ({
              ...message,
              createdAt: new Date(message.createdAt),
            })
          );
          setMessages(parsedMessages);
        } else {
          setMessages([]);
        }
      }
    },
    [threads]
  );

  // Delete thread
  const deleteThread = useCallback(
    (threadId: string) => {
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      // Remove messages from localStorage
      localStorage.removeItem(`t3-chat-messages-${threadId}`);

      // If deleting current thread, switch to first available thread or create new one
      if (currentThread?.id === threadId) {
        const remainingThreads = threads.filter((t) => t.id !== threadId);
        if (remainingThreads.length > 0 && remainingThreads[0]) {
          switchThread(remainingThreads[0].id);
        } else {
          createNewThread();
        }
      }
    },
    [currentThread, threads, switchThread, createNewThread]
  );

  // Send message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!currentThread || !content.trim()) return;

      const userMessage: Message = {
        id: uuidv4(),
        threadId: currentThread.id,
        role: "user",
        content: content.trim(),
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setIsTyping(true);

      try {
        const response = await fetch("/api/chat/completion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            model: selectedModel,
            threadId: currentThread.id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get AI response");
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Failed to read response stream");
        }

        const decoder = new TextDecoder();
        let assistantContent = "";

        const assistantMessage: Message = {
          id: uuidv4(),
          threadId: currentThread.id,
          role: "assistant",
          content: "",
          createdAt: new Date(),
          metadata: {
            model: selectedModel,
          },
        };

        setMessages((prev) => [...prev, assistantMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) {
                  assistantContent += content;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessage.id
                        ? { ...msg, content: assistantContent }
                        : msg
                    )
                  );
                }
              } catch (e) {
                // Ignore parse errors for streaming
              }
            }
          }
        }

        // Update thread title if this is the first message
        if (messages.length === 0) {
          const title =
            content.slice(0, 50) + (content.length > 50 ? "..." : "");
          const updatedThread = {
            ...currentThread,
            title,
            updatedAt: new Date(),
            messageCount: 2,
          };
          setCurrentThread(updatedThread);
          setThreads((prev) =>
            prev.map((t) => (t.id === currentThread.id ? updatedThread : t))
          );
        } else {
          // Update thread metadata
          const updatedThread = {
            ...currentThread,
            updatedAt: new Date(),
            messageCount: messages.length + 2,
            lastMessage: content.slice(0, 100),
          };
          setCurrentThread(updatedThread);
          setThreads((prev) =>
            prev.map((t) => (t.id === currentThread.id ? updatedThread : t))
          );
        }
      } catch (error) {
        console.error("Error sending message:", error);
        // Add error message
        const errorMessage: Message = {
          id: uuidv4(),
          threadId: currentThread.id,
          role: "assistant",
          content:
            "I'm sorry, I encountered an error while processing your request. Please try again.",
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    },
    [currentThread, messages, selectedModel]
  );

  // Edit message
  const editMessage = useCallback((messageId: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, content, createdAt: new Date() } : msg
      )
    );
  }, []);

  // Delete message
  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  // Filter threads based on search query
  const filteredThreads = threads.filter(
    (thread) =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Save messages to thread-specific localStorage when messages change
  useEffect(() => {
    if (currentThread && messages.length > 0) {
      localStorage.setItem(
        `t3-chat-messages-${currentThread.id}`,
        JSON.stringify(messages)
      );
    }
  }, [currentThread, messages]);

  const value: ChatContextType = {
    currentThread,
    messages,
    isLoading,
    isTyping,
    threads,
    createNewThread,
    switchThread,
    deleteThread,
    sendMessage,
    editMessage,
    deleteMessage,
    selectedModel,
    setSelectedModel,
    searchQuery,
    setSearchQuery,
    filteredThreads,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
