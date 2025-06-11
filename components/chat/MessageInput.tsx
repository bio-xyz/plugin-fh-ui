import { useState, useRef, useEffect } from "react";
import { useChat } from "../../contexts/ChatContext";
import { AVAILABLE_MODELS } from "../../types/chat";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

export default function MessageInput() {
  const {
    sendMessage,
    isLoading,
    selectedModel,
    setSelectedModel,
    currentThread,
  } = useChat();
  const [input, setInput] = useState("");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsModelDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput("");
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const selectedModelData = AVAILABLE_MODELS.find(
    (m) => m.id === selectedModel
  );

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end space-x-2">
            {/* Main input area */}
            <div className="flex-1 bg-gray-800 border border-gray-600 rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
              <div className="flex items-end">
                {/* Textarea */}
                <div className="flex-1 p-4">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here..."
                    disabled={isLoading}
                    className="w-full bg-transparent text-white placeholder-gray-400 border-none outline-none resize-none min-h-[24px] max-h-32"
                    rows={1}
                  />
                </div>

                {/* Attachment button */}
                <div className="p-2">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
                    title="Attach file (coming soon)"
                  >
                    <PaperClipIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Bottom bar with model selector and send button */}
              <div className="flex items-center justify-between px-4 pb-3">
                {/* Model selector */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <span>{selectedModelData?.name || selectedModel}</span>
                    <ChevronUpIcon
                      className={`h-4 w-4 transition-transform ${
                        isModelDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown */}
                  {isModelDropdownOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-72 bg-gray-800 border border-gray-600 rounded-xl shadow-xl z-10">
                      <div className="p-2">
                        {AVAILABLE_MODELS.map((model) => (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                              setSelectedModel(model.id);
                              setIsModelDropdownOpen(false);
                            }}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              selectedModel === model.id
                                ? "bg-indigo-600 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            }`}
                          >
                            <div className="font-medium">{model.name}</div>
                            <div className="text-sm opacity-75 mt-1">
                              {model.description}
                            </div>
                            <div className="text-xs opacity-60 mt-1">
                              Max tokens: {model.maxTokens.toLocaleString()}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Send button */}
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-lg transition-colors ${
                    input.trim() && !isLoading
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Character count and status */}
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <span>{input.length} characters</span>
              {currentThread && <span>Thread: {currentThread.title}</span>}
            </div>
            {isLoading && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <span>Sending...</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            Press <kbd className="px-1 py-0.5 bg-gray-700 rounded">Enter</kbd>{" "}
            to send,
            <kbd className="px-1 py-0.5 bg-gray-700 rounded ml-1">
              Shift + Enter
            </kbd>{" "}
            for new line
          </div>
        </form>
      </div>
    </div>
  );
}
