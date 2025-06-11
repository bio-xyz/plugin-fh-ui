import { useEffect } from "react";
import { useRouter } from "next/router";
import { usePrivy } from "@privy-io/react-auth";
import { ChatProvider } from "../contexts/ChatContext";
import Sidebar from "../components/chat/Sidebar";
import ChatArea from "../components/chat/ChatArea";
import MessageInput from "../components/chat/MessageInput";

export default function ChatPage() {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
    }
  }, [ready, authenticated, router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <ChatProvider>
      <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
        {/* Sidebar */}
        <div className="flex-shrink-0 w-80 border-r border-gray-700">
          <Sidebar />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages Area */}
          <div className="flex-1 overflow-hidden">
            <ChatArea />
          </div>

          {/* Message Input */}
          <div className="flex-shrink-0 border-t border-gray-700">
            <MessageInput />
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}
