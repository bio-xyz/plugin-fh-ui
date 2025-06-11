export interface Thread {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  lastMessage?: string;
}

export interface Message {
  id: string;
  threadId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    cost?: number;
  };
}

export interface ChatContextType {
  // Current chat state
  currentThread: Thread | null;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;

  // Thread management
  threads: Thread[];
  createNewThread: () => void;
  switchThread: (threadId: string) => void;
  deleteThread: (threadId: string) => void;

  // Message management
  sendMessage: (content: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;

  // Settings
  selectedModel: string;
  setSelectedModel: (model: string) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredThreads: Thread[];
}

export interface OpenAIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
}

export const AVAILABLE_MODELS: OpenAIModel[] = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o mini",
    description: "Good for everyday tasks",
    maxTokens: 8192,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "Bigger context, better logic",
    maxTokens: 128000,
  },
];

export interface ActionButton {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ACTION_BUTTONS: ActionButton[] = [
  {
    id: "create",
    title: "Create",
    description:
      "Draft grant proposals, write research papers, or generate biomedical datasets",
    icon: "sparkles",
  },
  {
    id: "explore",
    title: "Explore",
    description:
      "Delve into emerging biomedical research, diseases, and therapeutic targets",
    icon: "globe-alt",
  },
  {
    id: "code",
    title: "Code",
    description:
      "Analyze omics data, build bioinformatics pipelines, or simulate molecular systems",
    icon: "code-bracket",
  },
  {
    id: "learn",
    title: "Learn",
    description:
      "Get in-depth tutorials on molecular biology, genetics, pharmacology, and more",
    icon: "academic-cap",
  },
];

export const SAMPLE_PROMPTS = [
  "What are some likely mechanisms by which mutations near the HTRA1 locus in humans might be causal for age-related macular degeneration??",
  "How might you capture electron transfer effects using classical force fields for molecular dynamics simulations of protein-protein interactions?",
  "How compelling is genetic evidence for targeting PTH1R in small cell lung cancer?",
  "What factors limit the wavelengths of light detectable by mammalian eyes?",
];
