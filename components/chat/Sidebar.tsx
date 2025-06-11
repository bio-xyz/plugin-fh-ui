import { useState } from "react";
import { useChat } from "../../contexts/ChatContext";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
  TrashIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { usePrivy } from "@privy-io/react-auth";

export default function Sidebar() {
  const {
    threads,
    filteredThreads,
    currentThread,
    createNewThread,
    switchThread,
    deleteThread,
    searchQuery,
    setSearchQuery,
  } = useChat();
  const { user, logout } = usePrivy();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 7 * 24) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-lg font-semibold text-white">BioAgent</h1>
              <button
                onClick={createNewThread}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                <PlusIcon className="h-4 w-4 text-white" />
              </button>
            </div>

            {/* New Chat Button */}
            <button
              onClick={createNewThread}
              className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              New Chat
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-700">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search your threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto">
            {/* Today Section */}
            {filteredThreads.length > 0 && (
              <div className="p-4">
                <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                  Today
                </h2>
                <div className="space-y-1">
                  {filteredThreads.map((thread) => (
                    <div
                      key={thread.id}
                      className={`group relative flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        currentThread?.id === thread.id
                          ? "bg-gray-700 text-white"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                      onClick={() => switchThread(thread.id)}
                    >
                      <ChatBubbleLeftIcon className="h-4 w-4 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {thread.title}
                        </p>
                        {thread.lastMessage && (
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {thread.lastMessage}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center ml-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(thread.updatedAt)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteThread(thread.id);
                          }}
                          className="ml-2 p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredThreads.length === 0 && (
              <div className="p-4 text-center">
                <ChatBubbleLeftIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">
                  {searchQuery
                    ? "No matching conversations"
                    : "No conversations yet"}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {searchQuery
                    ? "Try a different search term"
                    : "Start a new chat to begin"}
                </p>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.email
                      ? String(user.email).charAt(0).toUpperCase()
                      : "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.email ? String(user.email) : "User"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {threads.length} conversation
                    {threads.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-white text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
