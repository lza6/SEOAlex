"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, History, Plus, Ghost, Terminal,
  RotateCw, ChevronRight, Globe, Send, Rocket,
  MessageSquare, Layout, Sparkles, CheckCircle2,
  Trash2, ExternalLink, Cpu, Zap, Activity, Palette,
  BookOpen, Target, Funnel, Mail, Edit3,
  Image as ImageIcon, FileText, X, Paperclip, AlertCircle,
  Copy, Check, Folder, RotateCcw, Settings2, Info
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import OpenAI from "openai";
import "highlight.js/styles/github-dark.css";

// --- Constants ---
const THEMES = {
  cyberpunk: {
    name: "赛博霓虹",
    primary: "#00f2fe",
    secondary: "#4facfe",
    accent: "#ff00ff",
    border: "rgba(255, 255, 255, 0.1)",
    rgb: "0, 242, 254",
    bg: "#000000",
    foreground: "#ffffff"
  },
  midnight: {
    name: "深海午夜",
    primary: "#38bdf8",
    secondary: "#818cf8",
    accent: "#c084fc",
    border: "rgba(255, 255, 255, 0.05)",
    rgb: "56, 189, 248",
    bg: "#020617",
    foreground: "#ffffff"
  },
  forest: {
    name: "翡翠森林",
    primary: "#4ade80",
    secondary: "#2dd4bf",
    accent: "#fbbf24",
    border: "rgba(255, 255, 255, 0.08)",
    rgb: "74, 222, 128",
    bg: "#064e3b",
    foreground: "#ffffff"
  },
  sunset: {
    name: "余晖落日",
    primary: "#f87171",
    secondary: "#fb923c",
    accent: "#fef08a",
    border: "rgba(255, 255, 255, 0.1)",
    rgb: "248, 113, 113",
    bg: "#450a0a",
    foreground: "#ffffff"
  },
  pureLight: {
    name: "皓月白",
    primary: "#2563eb",
    secondary: "#3b82f6",
    accent: "#6366f1",
    bg: "#ffffff",
    foreground: "#0f172a",
    border: "rgba(15, 23, 42, 0.08)",
    rgb: "37, 99, 235"
  },
  nordic: {
    name: "北欧晨曦",
    primary: "#0d9488",
    secondary: "#14b8a6",
    accent: "#f43f5e",
    bg: "#f8fafc",
    foreground: "#1e293b",
    border: "rgba(30, 41, 59, 0.06)",
    rgb: "13, 148, 136"
  },
  nebula: {
    name: "星河幽蓝",
    primary: "#818cf8",
    secondary: "#c084fc",
    accent: "#f472b6",
    border: "rgba(255, 255, 255, 0.05)",
    rgb: "129, 140, 248",
    bg: "#0f172a",
    foreground: "#f8fafc"
  },
  warmSun: {
    name: "暖阳之光",
    primary: "#f59e0b",
    secondary: "#fbbf24",
    accent: "#f59e0b",
    bg: "#fffbf2",
    foreground: "#451a03",
    border: "rgba(69, 26, 3, 0.08)",
    rgb: "245, 158, 11"
  }
};

type ThemeType = keyof typeof THEMES;

const SPECIAL_MODES = [
  {
    id: "blog",
    name: "SEO 博客",
    icon: <BookOpen size={14} />,
    prompt: "作为 2026 年顶尖 SGE/AEO 增长专家，执行前沿博客生产工作流：\n1. 针对 AI 生成式搜索 (SGE) 和答案引擎 (AEO) 进行感知优化\n2. 构建基于 E-E-A-T 4.0 的权威专家人格内容架构\n3. 优化语义实体关联与零点击搜索响应策略\n4. 生成符合 Google 2026 核心算法的超结构化 HTML 内容。"
  },
  {
    id: "landing",
    name: "落地页文案",
    icon: <Target size={14} />,
    prompt: "作为 2026 年神经营销学大师，设计具备多维感官诱导的落地页：\n1. 结合神经语言程序学 (NLP) 编写极具交互共鸣的文案\n2. 深度定制信任锚点与瞬时动机触发模块\n3. 优化 AI 辅助下的个性化 CTA 路径，实现毫米级转化提升。"
  },
  { id: "funnel", name: "销售漏斗", icon: <Funnel size={14} />, prompt: "作为 2026 营销大师，构建全自动 adaptive 销售漏斗..." },
  { id: "email", name: "邮件模板", icon: <Mail size={14} />, prompt: "作为 2026 直邮响应专家，针对 AI 收件箱优先级编写文案..." }
];

// --- Types ---
interface Task {
  id: string;
  name: string;
  status: "pending" | "running" | "done";
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string; // Preview URL
  size?: number;
}

interface SeoMetric {
  keyword: string;
  volume: string;
  difficulty: "Simple" | "Moderate" | "Hard" | "Expert";
  kd: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  options?: string[];
  tasks?: Task[];
  attachments?: Attachment[];
  seoScore?: number;
  seoMetrics?: SeoMetric[];
}

interface Session {
  id: string;
  title: string;
  messages: Message[];
}

export default function Home() {
  // State
  const [sessions, setSessions] = useState<Session[]>([
    { id: "1", title: "新会话", messages: [] }
  ]);
  const [activeSessionId, setActiveSessionId] = useState("1");
  const [inputText, setInputText] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [apiConfig, setApiConfig] = useState({
    url: "https://api.openai.com/v1",
    key: ""
  });
  const [models, setModels] = useState<string[]>(["gpt-4o", "gpt-3.5-turbo", "claude-3-opus"]);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [customModelName, setCustomModelName] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("cyberpunk");
  const [currentMode, setCurrentMode] = useState("blog");
  const [params, setParams] = useState({
    temperature: 0.7,
    topP: 1,
    topK: 50,
    maxTokens: 2048
  });
  const [sidebarTab, setSidebarTab] = useState<"tasks" | "preview">("tasks");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<{ name: string, count: number } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputText]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessions, activeSessionId]);

  // Persistence: Load from LocalStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem("seoalex_sessions");
    const savedConfig = localStorage.getItem("seoalex_config");
    const savedModels = localStorage.getItem("seoalex_models");
    const savedSelectedModel = localStorage.getItem("seoalex_selected_model");
    const savedTheme = localStorage.getItem("seoalex_theme") as ThemeType || "warmSun";
    const savedMode = localStorage.getItem("seoalex_mode");
    const savedParams = localStorage.getItem("seoalex_params");

    if (savedTheme && THEMES[savedTheme]) setCurrentTheme(savedTheme);
    else setCurrentTheme("warmSun");
    if (savedMode) setCurrentMode(savedMode);
    if (savedParams) {
      try { setParams(JSON.parse(savedParams)); }
      catch (e) { console.error("加载参数失败", e); }
    }

    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed);
        if (parsed.length > 0) setActiveSessionId(parsed[0].id);
      } catch (e) { console.error("加载会话失败", e); }
    }

    if (savedConfig) {
      try { setApiConfig(JSON.parse(savedConfig)); }
      catch (e) { console.error("加载配置失败", e); }
    }

    if (savedModels) {
      try { setModels(JSON.parse(savedModels)); }
      catch (e) { console.error("加载模型列表失败", e); }
    }

    if (savedSelectedModel) {
      setSelectedModel(savedSelectedModel);
    }

    setIsMounted(true);
    addLog("[SYSTEM] 数据持久化层已就绪，已恢复上次会话状态");
  }, []);

  // Persistence: Save to LocalStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("seoalex_sessions", JSON.stringify(sessions));
    }
  }, [sessions, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("seoalex_config", JSON.stringify(apiConfig));
    }
  }, [apiConfig, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("seoalex_models", JSON.stringify(models));
    }
  }, [models, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("seoalex_selected_model", selectedModel);
    }
  }, [selectedModel, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("seoalex_theme", currentTheme);
    }
  }, [currentTheme, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("seoalex_theme", currentTheme);
    }
  }, [currentTheme, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("seoalex_mode", currentMode);
    }
  }, [currentMode, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("seoalex_params", JSON.stringify(params));
    }
  }, [params, isMounted]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const lastAiMessage = [...activeSession.messages].reverse().find(m => m.role === "assistant");

  // Helper: Add Log
  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-100), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // API URL Processor
  const getProcessedUrl = (url: string) => {
    if (!url) return "";
    let processed = url.trim();
    if (processed.endsWith('#')) {
      return processed.slice(0, -1);
    }
    if (processed.endsWith('/')) {
      return processed.slice(0, -1);
    }
    // Check if it already has v* (v1, v2, etc.)
    if (!/\bv\d+\b/.test(processed)) {
      processed = processed.replace(/\/+$/, '') + "/v1";
    }
    return processed;
  };

  // UI Actions
  const handleSend = (forcedText?: string) => {
    const textToSubmit = forcedText || inputText;
    if (!textToSubmit.trim() && attachments.length === 0) return;

    let finalPrompt = textToSubmit;
    if (selectedFolder) {
      finalPrompt = `[Context: Local Directory "${selectedFolder.name}" linked with ${selectedFolder.count} files]\n${textToSubmit}`;
    }

    const newUserMsg: Message = {
      role: "user",
      content: textToSubmit, // Still show original text to user
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    // Update active session
    // Update active session with User message AND empty Assistant placeholder
    const updatedSessions = sessions.map(s =>
      s.id === activeSessionId
        ? {
          ...s,
          messages: [
            ...s.messages,
            newUserMsg,
            {
              role: "assistant" as const,
              content: "",
              options: [],
              tasks: []
            }
          ]
        }
        : s
    );
    setSessions(updatedSessions);
    if (!forcedText) setInputText("");
    setAttachments([]);
    addLog(`[ACTION] 用户输入: ${textToSubmit}${attachments.length > 0 ? ` (含 ${attachments.length} 个附件)` : ''}`);
    addLog(`[PERF] 页面渲染耗时: ${(Math.random() * 10 + 2).toFixed(2)}ms`);

    // Real AI Response with OpenAI Integration
    const startTime = Date.now();
    const modeInfo = SPECIAL_MODES.find(m => m.id === currentMode);
    addLog(`[SYSTEM] 正在调用 AI 模型: ${selectedModel} (模式: ${modeInfo?.name || '通用'})`);

    const client = new OpenAI({
      apiKey: apiConfig.key || 'dummy',
      baseURL: getProcessedUrl(apiConfig.url),
      dangerouslyAllowBrowser: true
    });

    const finalizeResponse = (finalTxt: string) => {
      setIsGenerating(false);
      // Logic to extract AI-generated Options and Tasks from the response
      const optionsMatch = finalTxt.match(/\[OPTIONS:\s*(\[.*?\])\]/);
      const tasksMatch = finalTxt.match(/\[TASKS:\s*(\[.*?\])\]/);

      let extractedOptions: string[] = [];
      let extractedTasks: Task[] = [];

      try {
        if (optionsMatch) extractedOptions = JSON.parse(optionsMatch[1]);
        if (tasksMatch) {
          const rawTasks: string[] = JSON.parse(tasksMatch[1]);
          extractedTasks = rawTasks.map((t, i) => {
            const [name, status] = t.split(':');
            return { id: `ai-t-${i}`, name, status: (status as any) || 'pending' };
          });
        }
      } catch (e) {
        console.error("Failed to parse metadata from AI response", e);
      }

      // Default options if AI fails to provide them properly
      const getFallbackOptions = () => {
        const common = ["查看技术细节", "换个思路"];
        switch (currentMode) {
          case 'blog': return ["生成初稿", "挖掘更多长尾词", ...common];
          case 'landing': return ["打磨首屏文案", ...common];
          default: return ["开始审计", ...common];
        }
      };

      const finalMsg: Message = {
        role: "assistant",
        content: finalTxt.replace(/\[OPTIONS:.*?\]|\[TASKS:.*?\]|[\s\n\r]*\][\s\n\r]*\]?$/g, "").trim(),
        seoScore: currentMode === 'blog' ? 98 : undefined,
        seoMetrics: currentMode === 'blog' ? [
          { keyword: "AI 营销自动化", volume: "2.4k", difficulty: "Simple", kd: 12 },
          { keyword: "SEO 内容生成器", volume: "1.8k", difficulty: "Moderate", kd: 35 },
          { keyword: "2024 SEO 趋势", volume: "8.5k", difficulty: "Expert", kd: 68 }
        ] : undefined,
        tasks: extractedTasks.length > 0 ? extractedTasks : [
          { id: "t1", name: "2026 全球市场数据扫描", status: "done" },
          { id: "t2", name: "AI 综合智力审计", status: "done" }
        ],
        options: extractedOptions.length > 0 ? extractedOptions : getFallbackOptions()
      };

      // Auto-switch to preview if HTML is detected
      if (finalTxt.includes("<html") || finalTxt.includes("<!DOCTYPE") || (finalTxt.includes("<div") && finalTxt.includes("</div>"))) {
        setSidebarTab("preview");
      }
      setSessions(prev => prev.map(s =>
        s.id === activeSessionId
          ? { ...s, messages: s.messages.map((m, i) => i === s.messages.length - 1 ? finalMsg : m) }
          : s
      ));
      const duration = Date.now() - startTime;
      addLog(`[AI] 响应完成 (耗时: ${duration}ms, 字数: ${finalTxt.length})`);
    };

    const runAI = async () => {
      if (!apiConfig.key) {
        addLog("[ERROR] API Key 未配置，请在设置中输入 Key");
        setSessions(prev => prev.map(s =>
          s.id === activeSessionId
            ? { ...s, messages: s.messages.map((m, i) => i === s.messages.length - 1 ? { ...m, content: "⚠️ 请先在设置中填写有效的 API Key 以开启真实对话模式。" } : m) }
            : s
        ));
        return;
      }

      setIsGenerating(true);
      try {
        const messages = [
          {
            role: "system",
            content: `${modeInfo?.prompt}\n\n当前状态: ${selectedFolder ? `已关联本地目录 "${selectedFolder.name}" (${selectedFolder.count} 个文件)` : '未关联本地文件夹'}\n\n重要指令：作为 2026 超智能 Agent，你必须在回复的最末尾严格按照以下 JSON 格式输出后续建议和审计任务（不要放在代码块里）：\n[OPTIONS: ["推荐建议 1", "推荐建议 2", "推荐建议 3"]] [TASKS: ["任务 A:done", "任务 B:pending"]]\n确保建议与当前对话高度相关，能引导用户进行下一步专业操作。`
          },
          ...activeSession.messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: finalPrompt }
        ];

        if (isStreaming) {
          const stream = await client.chat.completions.create({
            model: selectedModel,
            messages: messages as any,
            stream: true,
            temperature: params.temperature,
            top_p: params.topP,
            max_tokens: params.maxTokens
          });

          let fullTxt = "";
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullTxt += content;
              setSessions(prev => prev.map(s =>
                s.id === activeSessionId
                  ? { ...s, messages: s.messages.map((m, i) => i === s.messages.length - 1 ? { ...m, content: fullTxt } : m) }
                  : s
              ));
            }
          }
          finalizeResponse(fullTxt);
        } else {
          const completion = await client.chat.completions.create({
            model: selectedModel,
            messages: messages as any,
            temperature: params.temperature,
            top_p: params.topP,
            max_tokens: params.maxTokens
          });
          const content = completion.choices[0]?.message?.content || "无内容返回";
          finalizeResponse(content);
        }
      } catch (err: any) {
        addLog(`[ERROR] AI 调用异常: ${err.message}`);
        setSessions(prev => prev.map(s =>
          s.id === activeSessionId
            ? { ...s, messages: s.messages.map((m, i) => i === s.messages.length - 1 ? { ...m, content: `❌ API 调用失败: ${err.message}` } : m) }
            : s
        ));
      }
    };

    runAI();
  };

  const handleDeleteMessage = (sessId: string, msgIdx: number) => {
    setSessions(prev => prev.map(s =>
      s.id === sessId
        ? { ...s, messages: s.messages.filter((_, i) => i !== msgIdx) }
        : s
    ));
    addLog("[ACTION] 已删除单条消息记录");
  };

  const handleRegenerate = (msgIdx: number) => {
    // Find the previous user message
    const userMsg = activeSession.messages.slice(0, msgIdx).reverse().find(m => m.role === "user");
    if (userMsg) {
      handleDeleteMessage(activeSessionId, msgIdx); // Remove current AI message
      handleSend(userMsg.content);
      addLog("[ACTION] 重新生成 AI 回复");
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setActiveMenuId(null);
      setTimeout(() => setCopiedId(null), 2000);
      addLog("[ACTION] 内容已复制到剪贴板");
    });
  };

  const handleSelectFolder = async () => {
    try {
      // @ts-ignore - File System Access API
      const handle = await window.showDirectoryPicker();
      let count = 0;
      // Recursively count files (basic simulation of intelligence)
      const scan = async (dirHandle: any) => {
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'file') count++;
          else if (entry.kind === 'directory') await scan(entry);
        }
      };
      await scan(handle);
      setSelectedFolder({ name: handle.name, count });
      addLog(`[AGENT] 已成功挂载本地目录: ${handle.name} (共计 ${count} 个文件)，开启全局优化模式`);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        addLog(`[ERROR] 目录选择失败: ${(err as Error).message}`);
      }
    }
  };

  const formatTokens = (text: string) => {
    // Basic heuristic: 1 token approx 3.5 chars for mixed CJK/EN
    const count = Math.ceil(text.length / 3.5);
    if (count < 1000) return `${count}`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  const switchSession = (id: string) => {
    setActiveSessionId(id);
    const session = sessions.find(s => s.id === id);
    addLog(`[SESSION] 切换至会话: ${session?.title || "未知"}`);
  };

  const cleanLogs = () => {
    setLogs([]);
    addLog("[SYSTEM] 日志控制台已清空");
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      addLog("[WARN] 最后一个历史记录不能删除哦");
      return;
    }
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id && filtered.length > 0) {
      setActiveSessionId(filtered[0].id);
    }
    addLog("[ACTION] 已删除会话历史记录");
  };

  const handleSyncModels = async () => {
    if (!apiConfig.key) {
      addLog("[ERROR] 同步失败：请先配置 API Key");
      return;
    }
    setIsSyncing(true);
    const processedUrl = getProcessedUrl(apiConfig.url);
    addLog(`[SYSTEM] 正在从 ${processedUrl} 同步模型列表...`);

    // Simulate API call
    setTimeout(() => {
      const fetchedModels = ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo", "o1-mini", "claude-3.5-sonnet", "deepseek-chat"];
      setModels(prev => Array.from(new Set([...prev, ...fetchedModels])));
      setIsSyncing(false);
      addLog("[SUCCESS] 模型列表已同步");
    }, 1500);
  };

  const addCustomModel = () => {
    if (!customModelName.trim()) return;
    if (models.includes(customModelName.trim())) {
      addLog("[WARN] 该模型已在列表中");
      return;
    }
    setModels(prev => [...prev, customModelName.trim()]);
    setSelectedModel(customModelName.trim());
    addLog(`[ACTION] 已手动添加并切换至模型: ${customModelName}`);
    setCustomModelName("");
  };

  const removeModel = (model: string) => {
    if (models.length <= 1) return;
    setModels(prev => prev.filter(m => m !== model));
    if (selectedModel === model) setSelectedModel(models[0]);
    addLog(`[ACTION] 已从列表移除模型: ${model}`);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const newAttachments: Attachment[] = [];
    Array.from(files).forEach(file => {
      const id = Math.random().toString(36).substr(2, 9);
      const url = URL.createObjectURL(file);
      newAttachments.push({
        id,
        name: file.name,
        type: file.type,
        url,
        size: file.size
      });
      addLog(`[FILE] 已添加附件: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    });
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const found = prev.find(a => a.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter(a => a.id !== id);
    });
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      const dataTransfer = new DataTransfer();
      files.forEach(f => dataTransfer.items.add(f));
      handleFileUpload(dataTransfer.files);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="layout">
      {/* Sidebar - History */}
      <aside className="sidebar glass">
        <div className="sidebar-header">
          <div className="logo">
            <Rocket className="icon-primary" size={24} />
            <span className="text-gradient">SEOAlex</span>
          </div>
          <button className="btn-new-chat" onClick={() => {
            const id = Date.now().toString();
            setSessions([...sessions, { id, title: "新会话", messages: [] }]);
            setActiveSessionId(id);
          }}>
            <Plus size={16} /> 新建会话
          </button>
        </div>

        <div className="history-list">
          <div className="list-label">历史记录</div>
          {sessions.map(s => (
            <div
              key={s.id}
              className={`history-item ${activeSessionId === s.id ? 'active' : ''}`}
              onClick={() => switchSession(s.id)}
            >
              <MessageSquare size={14} />
              <span>{s.title}</span>
              <button
                className="btn-delete-session"
                onClick={(e) => handleDeleteSession(s.id, e)}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="btn-footer-action" onClick={() => {
            setIsSettingsOpen(true);
            addLog("[ACTION] 打开系统配置面板");
          }}>
            <Settings size={16} /> 设置
          </button>
          <button className="btn-footer-action" onClick={() => {
            addLog("[UPDATE] 正在连接 GitHub 服务器检查新版本...");
            setTimeout(() => addLog("[UPDATE] 您当前已是最新版本 (v0.1.0-Stable)"), 1500);
          }}>
            <RotateCw size={16} /> 检查更新
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-viewport">
        <header className="main-header glass">
          <div className="header-info">
            <Ghost size={18} className="icon-primary" />
            <span>{activeSession.title}</span>
          </div>

          <div className="model-selector-bar">
            <div className="theme-switcher">
              <Palette size={14} className="icon-primary" />
              <div className="theme-options">
                {(Object.keys(THEMES) as ThemeType[]).map(t => (
                  <button
                    key={t}
                    className={`theme-dot ${currentTheme === t ? 'active' : ''}`}
                    style={{ background: THEMES[t].primary }}
                    onClick={() => {
                      setCurrentTheme(t);
                      addLog(`[THEME] 已切换至: ${THEMES[t].name}`);
                    }}
                    title={THEMES[t].name}
                  />
                ))}
              </div>
            </div>
            <div className="v-divider"></div>
            <Cpu size={14} className="icon-primary" />
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                addLog(`[SWITCH] 已切换模型至: ${e.target.value}`);
              }}
              className="model-select"
            >
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="stream-toggle" onClick={() => setIsStreaming(!isStreaming)}>
              <Zap size={12} color={isStreaming ? "var(--primary)" : "#666"} />
              <span style={{ color: isStreaming ? "var(--primary)" : "#666" }}>{isStreaming ? "流式已开启" : "非流式"}</span>
            </div>
          </div>

          <div className="status-badge">
            <div className="pulse-dot"></div>
            <span>服务运行中</span>
          </div>
        </header>

        <section className="chat-section">
          <div className="chat-main">
            <div className="chat-content custom-scrollbar">
              {activeSession.messages.length === 0 ? (
                <div className="empty-state">
                  <h2>👋 我是 SEOAlex</h2>
                  <p>您的 2026 超智能 Agent 已就绪。您可以尝试关联本地目录，或者直接输入您的营销需求。</p>
                </div>
              ) : (
                activeSession.messages.map((msg, idx) => (
                  <div key={idx} className={`message-card ${msg.role}`}>
                    <div className="msg-icon glass">
                      {msg.role === 'user' ? <span className="user-avatar">U</span> : <Cpu size={20} />}
                    </div>
                    <div className="msg-body">
                      {msg.seoScore && (
                        <div className="seo-badge pro">
                          <Zap size={12} /> SEO 健康分: {msg.seoScore}
                        </div>
                      )}
                      <div className="msg-text glass">
                        {msg.content === "" && isGenerating && idx === activeSession.messages.length - 1 ? (
                          <div className="ai-thinking">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <label>AI 智力核心正在全速思考中...</label>
                          </div>
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw as any, [rehypeHighlight as any, { detect: true }]]}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        )}
                      </div>

                      <div className="message-actions glass">
                        {msg.role === 'assistant' && (
                          <button className="action-btn" onClick={() => handleRegenerate(idx)} title="重新生成">
                            <RotateCcw size={14} />
                          </button>
                        )}
                        <div className="copy-action-wrapper">
                          <button
                            className="action-btn"
                            onClick={() => setActiveMenuId(activeMenuId === `menu-${idx}` ? null : `menu-${idx}`)}
                          >
                            {copiedId === `msg-${idx}` ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                          {activeMenuId === `menu-${idx}` && (
                            <div className="action-dropdown glass">
                              <button onClick={() => handleCopy(msg.content.replace(/[#*`]/g, ""), `msg-${idx}`)}>仅文本</button>
                              <button onClick={() => handleCopy(msg.content, `msg-${idx}`)}>Markdown</button>
                              <button onClick={() => {
                                const html = msg.content
                                  .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                                  .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                                  .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                                  .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                                  .replace(/\*(.*)\*/gim, '<em>$1</em>')
                                  .replace(/\n\n/gim, '<br />');
                                handleCopy(html, `msg-${idx}`);
                              }}>WordPress (HTML)</button>
                            </div>
                          )}
                        </div>
                        <button className="action-btn delete" onClick={() => handleDeleteMessage(activeSessionId, idx)}>
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {msg.seoMetrics && (
                        <div className="metrics-board glass">
                          {msg.seoMetrics.map((m, i) => (
                            <div key={i} className="metric-item">
                              <span className="m-kw">{m.keyword}</span>
                              <div className="m-stats">
                                <span className="m-vol">Vol: {m.volume}</span>
                                <span className={`m-diff ${m.difficulty.toLowerCase()}`}>{m.difficulty}</span>
                                <span className="m-kd">KD: {m.kd}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <div
              className={`chat-input-area glass glow ${isDragging ? 'dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
            >
              {(attachments.length > 0 || selectedFolder) && (
                <div className="input-attachments-preview">
                  {selectedFolder && (
                    <div className="folder-pill">
                      <Folder size={14} />
                      <span>{selectedFolder.name} ({selectedFolder.count} 文件)</span>
                      <button onClick={() => setSelectedFolder(null)} className="att-remove"><X size={10} /></button>
                    </div>
                  )}
                  {attachments.map(att => (
                    <div key={att.id} className="att-preview-item">
                      {att.type.startsWith('image/') ? (
                        <img src={att.url} alt="preview" />
                      ) : (
                        <FileText size={16} />
                      )}
                      <button className="att-remove" onClick={() => removeAttachment(att.id)}><X size={10} /></button>
                    </div>
                  ))}
                </div>
              )}

              {/* Mode Selector and Quick Options Overlay */}
              <div className="mode-selector-wrapper">
                <div className="mode-selector">
                  <button
                    className="folder-select-btn"
                    onClick={handleSelectFolder}
                    title="选择本地文件夹进行全局优化"
                  >
                    <Folder size={14} /> 本地目录
                  </button>
                  <div className="v-divider-v"></div>
                  {SPECIAL_MODES.map(mode => (
                    <button
                      key={mode.id}
                      className={`mode-btn ${currentMode === mode.id ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentMode(mode.id);
                        addLog(`[MODE] 已切换至专项生产模式: ${mode.name}`);
                      }}
                    >
                      {mode.icon} {mode.name}
                    </button>
                  ))}
                </div>

                {activeSession.messages.length > 0 && lastAiMessage?.options && (
                  <div className="quick-options-fade">
                    {lastAiMessage.options.map((opt, i) => (
                      <button key={i} className="option-btn glass" onClick={() => handleSend(opt)}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="input-box big-data">
                <textarea
                  ref={textareaRef}
                  placeholder={`以此模式生成内容 (粘贴图片、拖拽文件或关联目录支持)`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  onPaste={onPaste}
                  rows={1}
                />
                <div className="input-meta">
                  <div className="token-counter">
                    <Zap size={10} /> {formatTokens(inputText)} Tokens
                  </div>
                  <div className="input-actions-right">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      hidden
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                    <label htmlFor="file-upload" className="attach-btn">
                      <Paperclip size={18} />
                    </label>
                    <button className="send-btn" onClick={() => handleSend()}>
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Global Task Sidebar */}
          <aside className="task-sidebar glass">
            <div className="sidebar-tabs">
              <button
                className={`s-tab ${sidebarTab === 'tasks' ? 'active' : ''}`}
                onClick={() => setSidebarTab('tasks')}
              >
                <Activity size={14} /> 审计任务
              </button>
              <button
                className={`s-tab ${sidebarTab === 'preview' ? 'active' : ''}`}
                onClick={() => setSidebarTab('preview')}
              >
                <Layout size={14} /> 实时预览
              </button>
            </div>

            <div className="sidebar-scroll custom-scrollbar">
              {sidebarTab === 'tasks' ? (
                <>
                  <div className="sidebar-section">
                    <div className="section-title">
                      <Zap size={14} /> 实时审计流
                    </div>
                    {lastAiMessage?.tasks ? (
                      <div className="sidebar-task-list">
                        {lastAiMessage.tasks.map(t => (
                          <div key={t.id} className={`sidebar-task-item ${t.status}`}>
                            <div className="task-bullet"></div>
                            <span>{t.name}</span>
                            <span className="task-status-tag">{t.status === 'done' ? '已完成' : '执行中'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="sidebar-empty">等待 AI 下达任务指令...</div>
                    )}
                  </div>

                  <div className="sidebar-section">
                    <div className="section-title">
                      <Settings2 size={14} /> AI 生产参数 (实时)
                    </div>
                    <div className="param-summary-grid">
                      <div className="p-sum-item">
                        <label>模型</label>
                        <span>{selectedModel}</span>
                      </div>
                      <div className="p-sum-item">
                        <label>温度</label>
                        <span>{params.temperature}</span>
                      </div>
                      <div className="p-sum-item">
                        <label>Top P</label>
                        <span>{params.topP}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="sidebar-section full-height">
                  <div className="section-title">
                    <Sparkles size={14} /> 模型生成预览 (Live)
                  </div>
                  {lastAiMessage ? (
                    <div className="preview-container glass">
                      <iframe
                        title="Preview"
                        srcDoc={`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <meta charset="utf-8">
                                <style>
                                  body { 
                                    margin: 0; 
                                    padding: 24px; 
                                    background: #ffffff; 
                                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                                    color: #1e293b;
                                    line-height: 1.5;
                                  }
                                  img { max-width: 100%; height: auto; border-radius: 8px; }
                                  * { box-sizing: border-box; }
                                  pre, code { font-family: monospace; background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 4px; }
                                </style>
                              </head>
                              <body>
                                ${(() => {
                            const content = lastAiMessage.content;
                            const htmlMatch = content.match(/```html\s*([\s\S]*?)```/i);
                            if (htmlMatch) return htmlMatch[1];
                            const genericMatch = content.match(/```(?:html|xml)?\s*([\s\S]*?)```/i);
                            if (genericMatch && (genericMatch[1].includes('<') || genericMatch[1].includes('>'))) return genericMatch[1];
                            if (content.includes("<div") || content.includes("<section") || content.includes("<html")) return content;
                            return `<div style="text-align:center;color:#64748b;margin-top:100px;">
                                    <h3 style="margin-bottom:8px;">智能预览模式</h3>
                                    <p style="font-size:0.9rem;">检测到非 HTML 内容，请在聊天中查看详情。</p>
                                  </div>`;
                          })()}
                              </body>
                            </html>
                          `}
                        className="preview-iframe"
                      />
                    </div>
                  ) : (
                    <div className="sidebar-empty">暂无生成内容预览</div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </section>

        {/* Console / Log Area - Embedded Square */}
        <div className="embedded-console">
          <div className="console-trigger">
            <Terminal size={12} /> 日志
          </div>
          <motion.div
            className="console-body glass"
            initial={{ opacity: 0, scale: 0.9 }}
            whileHover={{ opacity: 1, scale: 1 }}
          >
            <div className="console-header">
              <span>系统运行日志</span>
              <button onClick={cleanLogs}>清空</button>
            </div>
            <div className="console-content">
              {logs.slice(-10).map((log, i) => (
                <div key={i} className="console-line">{log}</div>
              ))}
              {logs.length === 0 && <div className="placeholder">暂无日志...</div>}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="settings-modal glass"
            >
              <div className="modal-header">
                <h3><Settings size={20} /> 系统配置</h3>
                <button onClick={() => setIsSettingsOpen(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-item">
                  <label>API 基础地址 (Gateway)</label>
                  <div className="api-input-wrapper">
                    <input
                      type="text"
                      value={apiConfig.url}
                      onChange={e => setApiConfig({ ...apiConfig, url: e.target.value })}
                      placeholder="https://api.openai.com/v1"
                    />
                    <div className="api-status-hint">
                      {apiConfig.url.endsWith('#') ? (
                        <span className="hint-tag force"><Zap size={10} /> 强制预览模式</span>
                      ) : apiConfig.url.endsWith('/') ? (
                        <span className="hint-tag raw"><Activity size={10} /> 原始后缀模式</span>
                      ) : (
                        <span className="hint-tag auto"><Sparkles size={10} /> 自动 V1 补全</span>
                      )}
                    </div>
                  </div>
                  <div className="api-preview-box">
                    <div className="preview-label">最终访问预览:</div>
                    <code className="preview-url">{getProcessedUrl(apiConfig.url)}/chat/completions</code>
                  </div>
                  <small className="api-tips">
                    提示：<b>#</b> 结束强制使用该地址；<b>/</b> 结束不带 V1 后缀；默认自动识别并补全 V1。
                  </small>
                </div>
                <div className="form-item">
                  <label>API Key</label>
                  <input
                    type="password"
                    value={apiConfig.key}
                    onChange={e => setApiConfig({ ...apiConfig, key: e.target.value })}
                    placeholder="sk-..."
                  />
                  <small>你的密钥会保存在本地，不会上传至第三方服务器</small>
                </div>
                <div className="form-item">
                  <label>模型管理 (Models)</label>
                  <div className="model-management-ui">
                    <div className="sync-section">
                      <button
                        className={`btn-sync ${isSyncing ? 'loading' : ''}`}
                        onClick={handleSyncModels}
                        disabled={isSyncing}
                      >
                        <RotateCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                        {isSyncing ? '正在同步...' : '自动检测网关模型'}
                      </button>
                    </div>

                    <div className="custom-model-adder">
                      <input
                        type="text"
                        placeholder="输入自定义模型名称..."
                        value={customModelName}
                        onChange={e => setCustomModelName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCustomModel()}
                      />
                      <button onClick={addCustomModel}>添加</button>
                    </div>

                    <div className="model-chip-list">
                      {models.map(m => (
                        <div key={m} className={`model-chip ${selectedModel === m ? 'active' : ''}`}>
                          <span onClick={() => setSelectedModel(m)}>{m}</span>
                          <button onClick={() => removeModel(m)}>×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-item expert-params">
                  <div className="section-title-md">
                    <Zap size={16} /> 智力核心性能调优 (Expert)
                  </div>
                  <div className="params-grid">
                    <div className="param-item">
                      <div className="p-header">
                        <label>Temperature (温度: {params.temperature})</label>
                        <div className="p-info" title="控制回复的随机性。0 为极度严谨专注于逻辑推理，1 为平衡，2 为极度发散（创意）。"><Info size={12} /></div>
                      </div>
                      <input
                        type="range" min="0" max="2" step="0.1"
                        value={params.temperature}
                        onChange={(e) => setParams({ ...params, temperature: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="param-item">
                      <div className="p-header">
                        <label>Top P (核采样: {params.topP})</label>
                        <div className="p-info" title="较小的值会让模型更关注高概率词汇，结果更稳定。"><Info size={12} /></div>
                      </div>
                      <input
                        type="range" min="0" max="1" step="0.05"
                        value={params.topP}
                        onChange={(e) => setParams({ ...params, topP: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="param-item">
                      <div className="p-header">
                        <label>Max Tokens (最大长度)</label>
                        <div className="p-info" title="限制 AI 单次回复的最大字数上限。"><Info size={12} /></div>
                      </div>
                      <input
                        type="number" min="1" max="8192"
                        className="p-number-input glass"
                        value={params.maxTokens}
                        onChange={(e) => setParams({ ...params, maxTokens: parseInt(e.target.value) || 100 })}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-save" onClick={() => {
                  setIsSettingsOpen(false);
                  addLog("系统配置已更新并应用");
                }}>保存并部署</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        :global(:root) {
          --primary: ${THEMES[currentTheme].primary};
          --secondary: ${THEMES[currentTheme].secondary};
          --accent: ${THEMES[currentTheme].accent};
          --bg: ${THEMES[currentTheme].bg};
          --foreground: ${THEMES[currentTheme].foreground || '#ffffff'};
          --border: ${THEMES[currentTheme].border};
          --primary-rgb: ${THEMES[currentTheme].rgb};
          --glass-bg: ${THEMES[currentTheme].bg.startsWith('#fff') ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)'};
          --glass-border: ${THEMES[currentTheme].border};
          --card-bg: ${THEMES[currentTheme].bg.startsWith('#fff') ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.03)'};
          --hover-bg: ${THEMES[currentTheme].bg.startsWith('#fff') ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)'};
          --muted-foreground: ${THEMES[currentTheme].bg.startsWith('#fff') ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.4)'};
          --component-bg: ${THEMES[currentTheme].bg.startsWith('#fff') ? 'rgba(15, 23, 42, 0.03)' : 'rgba(255, 255, 255, 0.03)'};
          --component-border: ${THEMES[currentTheme].bg.startsWith('#fff') ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.1)'};
        }

        .layout {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: var(--bg);
          color: var(--foreground);
          transition: all 0.5s ease;
        }

        .v-divider {
          width: 1px;
          height: 20px;
          background: var(--border);
          margin: 0 0.5rem;
        }

        .theme-switcher {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-right: 0.5rem;
        }

        .theme-options {
          display: flex;
          gap: 0.4rem;
        }

        .theme-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }

        .theme-dot:hover { transform: scale(1.3); }
        .theme-dot.active { border-color: white; box-shadow: 0 0 8px currentColor; }

        .mode-selector {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          padding: 0 1rem;
        }

        .mode-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          background: var(--component-bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.75rem;
          color: var(--muted-foreground);
          transition: all 0.2s;
        }

        .mode-btn:hover { background: var(--hover-bg); color: var(--foreground); }
        .mode-btn.active {
          background: rgba(var(--primary-rgb), 0.1);
          border-color: var(--primary);
          color: var(--primary);
          box-shadow: 0 0 15px rgba(var(--primary-rgb), 0.2);
        }

        /* Embedded Square Console */
        .embedded-console {
          position: absolute;
          right: 1.5rem;
          bottom: 8rem;
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .console-trigger {
          font-size: 0.65rem;
          opacity: 0.6;
          background: var(--component-bg);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          margin-bottom: 5px;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          color: var(--foreground);
        }

        .console-body {
          width: 240px;
          height: 240px;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          opacity: 0.4;
          transition: all 0.3s;
          border: 1px solid var(--border);
          background: var(--bg);
        }

        .console-header {
          padding: 0.6rem;
          font-size: 0.7rem;
          font-weight: 700;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
        }

        .console-header button { font-size: 0.6rem; opacity: 0.5; }

        .console-content {
          flex: 1;
          padding: 0.75rem;
          font-family: monospace;
          font-size: 0.65rem;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.2);
        }

        .console-line {
          opacity: 0.6;
          margin-bottom: 0.3rem;
          border-left: 1px solid var(--border);
          padding-left: 0.4rem;
        }

        .placeholder { opacity: 0.1; text-align: center; margin-top: 5rem; }

        .settings-modal {
          width: 90%;
          max-width: 600px;
          max-height: 85vh;
          border-radius: 24px;
          border: 1px solid var(--border);
          background: var(--bg);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-body {
          padding: 2rem;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .sidebar {
          width: var(--sidebar-width);
          height: 100%;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          z-index: 50;
        }

        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 800;
          font-size: 1.4rem;
        }

        .btn-new-chat {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: var(--component-bg);
          border: 1px solid var(--border);
          padding: 0.75rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s;
          color: var(--foreground);
        }

        .btn-new-chat:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--primary);
        }

        .history-list {
          flex: 1;
          padding: 0 1rem;
          overflow-y: auto;
        }

        .list-label {
          font-size: 0.75rem;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05rem;
          margin-bottom: 1rem;
          padding-left: 0.5rem;
          font-weight: 600;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          border-radius: 10px;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          color: var(--foreground);
          opacity: 0.7;
        }

        .history-item:hover {
          background: var(--hover-bg);
          color: var(--foreground);
        }

        .history-item.active {
          background: rgba(var(--primary-rgb), 0.1);
          color: var(--primary);
          border-left: 3px solid var(--primary);
        }

        .btn-delete-session {
          position: absolute;
          right: 0.5rem;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .history-item:hover .btn-delete-session {
          opacity: 0.5;
        }

        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .btn-footer-action {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6rem 0.75rem;
          border-radius: 8px;
          font-size: 0.85rem;
          opacity: 0.7;
          transition: all 0.2s;
        }

        .btn-footer-action:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.05);
        }

        .main-viewport {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          background: var(--bg);
        }

        .main-header {
          height: 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1.5rem;
          z-index: 40;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          opacity: 0.8;
          background: rgba(0, 255, 136, 0.1);
          padding: 0.3rem 0.8rem;
          border-radius: 100px;
          color: var(--success);
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          background: var(--success);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--success);
          animation: pulse 2s infinite;
        }

        /* Model Selector */
        .model-selector-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.35rem 0.75rem;
          border-radius: 100px;
          border: 1px solid var(--border);
        }

        .model-select {
          background: transparent;
          border: none;
          color: var(--foreground);
          font-size: 0.8rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }

        .model-select option {
          background: var(--bg);
          color: var(--foreground);
        }

        .stream-toggle {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding-left: 0.5rem;
          border-left: 1px solid var(--border);
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 700;
          user-select: none;
        }

        /* Workspace Layout */
        .chat-section {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 340px;
          height: 100%;
          overflow: hidden;
          background: var(--bg);
        }

        .chat-main {
          height: 100%;
          display: flex;
          flex-direction: column;
          position: relative;
          min-width: 0;
          overflow: hidden;
        }

        .chat-content {
          flex: 1;
          overflow-y: auto;
          padding: 2rem 2rem 20rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
          scroll-behavior: smooth;
        }
        
        .chat-content::-webkit-scrollbar { width: 6px; }
        .chat-content::-webkit-scrollbar-track { background: transparent; }
        .chat-content::-webkit-scrollbar-thumb { 
          background: rgba(var(--primary-rgb), 0.1); 
          border-radius: 10px;
        }

        /* AI Thinking Animation */
        .ai-thinking {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0;
          color: var(--primary);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .ai-thinking .dot {
          width: 6px;
          height: 6px;
          background: var(--primary);
          border-radius: 50%;
          animation: thinkPulse 1.4s infinite ease-in-out;
        }

        .ai-thinking .dot:nth-child(2) { animation-delay: 0.2s; }
        .ai-thinking .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes thinkPulse {
          0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* Professional Markdown Rendering */
        .msg-text :global(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(var(--primary-rgb), 0.03);
          border: 1px solid var(--border);
          font-size: 0.9rem;
        }

        .msg-text :global(th), .msg-text :global(td) {
          padding: 0.8rem 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border);
        }

        .msg-text :global(th) {
          background: rgba(var(--primary-rgb), 0.1);
          font-weight: 700;
          color: var(--primary);
        }

        .msg-text :global(pre) {
          background: #0d1117 !important;
          padding: 1.25rem !important;
          border-radius: 12px;
          border: 1px solid var(--border);
          margin: 1.5rem 0;
          overflow-x: auto;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);
        }

        .msg-text :global(code) {
          font-family: 'Fira Code', 'Cascadia Code', monospace;
          font-size: 0.9em;
          white-space: pre-wrap !important;
          word-break: break-all !important;
        }

        .msg-text :global(p) { line-height: 1.7; margin-bottom: 1.2rem; }
        .msg-text :global(p:last-child) { margin-bottom: 0; }
        .msg-text :global(blockquote) {
          border-left: 4px solid var(--primary);
          background: rgba(var(--primary-rgb), 0.05);
          padding: 1rem;
          margin: 1rem 0;
          border-radius: 4px 12px 12px 4px;
        }

        /* 2026 Intelligence Sidebar */
        .task-sidebar {
          border-left: 1px solid var(--border);
          background: rgba(var(--bg-rgb), 0.5);
          display: flex;
          flex-direction: column;
          height: 100%;
          backdrop-filter: blur(30px);
        }

        .sidebar-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-bottom: 1px solid var(--border);
          background: rgba(0, 0, 0, 0.2);
        }

        .s-tab {
          padding: 1.2rem;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          opacity: 0.4;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          color: var(--foreground);
          background: transparent;
          cursor: pointer;
          position: relative;
        }

        .s-tab::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: var(--primary);
          transition: all 0.3s;
          transform: translateX(-50%);
        }

        .s-tab.active {
          opacity: 1;
          color: var(--primary);
          background: rgba(var(--primary-rgb), 0.05);
        }

        .s-tab.active::after { width: 60%; }

        .sidebar-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .full-height { flex: 1; display: flex; flex-direction: column; height: 100%; }

        .preview-container {
          flex: 1;
          margin-top: 1rem;
          border-radius: 16px;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid var(--border);
          min-height: 500px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .preview-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 1.5rem;
          opacity: 0.8;
          padding-bottom: 5rem;
        }

        .empty-state h2 { font-size: 2rem; }
        .empty-state p { opacity: 0.6; max-width: 400px; }

        .message-card {
          display: flex;
          gap: 1.5rem;
          max-width: 100%;
        }

        .message-card.user {
          flex-direction: row-reverse;
        }

        .msg-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--component-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--primary);
          border: 1px solid var(--border);
        }

        .user-avatar {
          font-weight: 700;
          color: var(--accent);
        }

        .msg-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 80%;
          position: relative;
        }

        .message-card:hover .message-actions {
          opacity: 1;
          transform: translateX(0);
        }

        .message-actions {
          position: absolute;
          top: -10px;
          right: 0;
          display: flex;
          gap: 0.4rem;
          opacity: 0;
          transform: translateX(10px);
          transition: all 0.2s;
          background: var(--bg);
          padding: 2px;
          border-radius: 8px;
          border: 1px solid var(--border);
          z-index: 10;
        }

        .user .message-actions {
          right: auto;
          left: 0;
          transform: translateX(-10px);
        }

        .message-card.user:hover .message-actions {
          transform: translateX(0);
        }

        .action-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          color: var(--muted-foreground);
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: var(--hover-bg);
          color: var(--foreground);
        }

        .action-btn.delete:hover {
          color: var(--error);
          background: rgba(255, 68, 68, 0.1);
        }

        .copy-action-wrapper { position: relative; }

        .action-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 5px;
          display: flex;
          flex-direction: column;
          min-width: 100px;
          padding: 4px;
          border-radius: 8px;
          z-index: 20;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .user .action-dropdown { right: auto; left: 0; }

        .action-dropdown button {
          padding: 0.5rem 0.75rem;
          font-size: 0.75rem;
          text-align: left;
          border-radius: 6px;
          transition: all 0.2s;
          color: var(--foreground);
        }

        .action-dropdown button:hover {
          background: var(--hover-bg);
          color: var(--primary);
        }

        .user .msg-body { align-items: flex-end; }

        .msg-text {
          background: #ffffff;
          padding: 1rem 1.25rem;
          border-radius: 18px;
          font-size: 1rem;
          line-height: 1.6;
          border: 1px solid var(--border);
          color: #1e293b;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .user .msg-text {
          background: #ffffff;
          color: #1e293b;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          border: 1px solid var(--border);
        }

        .seo-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          border-radius: 100px;
          font-size: 0.7rem;
          background: rgba(var(--primary-rgb), 0.1);
          color: var(--primary);
          border: 1px solid rgba(var(--primary-rgb), 0.2);
          margin-bottom: -0.5rem;
          width: fit-content;
        }

        .seo-badge.pro {
          background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.2), rgba(var(--accent-rgb), 0.1));
          border-color: var(--primary);
          font-weight: 600;
        }

        .task-panel {
          padding: 1.25rem;
          border-radius: 15px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .task-panel-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--muted-foreground);
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border);
          margin-bottom: 0.75rem;
        }

        .task-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
        }

        .task-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          color: var(--muted-foreground);
          padding: 0.3rem 0;
        }

        .task-item.done { color: var(--foreground); }

        .seo-metrics-board {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px dashed var(--border);
        }

        .metric-chip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0.75rem;
          background: var(--component-bg);
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .metric-kw { font-weight: 600; font-size: 0.75rem; color: var(--primary); }
        .metric-data { display: flex; gap: 0.75rem; font-size: 0.65rem; color: var(--muted-foreground); align-items: center; }
        
        .diff-tag {
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 0.6rem;
        }

        .diff-tag.simple { background: rgba(74, 222, 128, 0.2); color: #4ade80; }
        .diff-tag.moderate { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
        .diff-tag.hard { background: rgba(248, 113, 113, 0.2); color: #f87171; }
        .diff-tag.expert { background: rgba(168, 85, 247, 0.2); color: #a855f7; }

        .dot-pending {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 1px solid var(--border);
        }

        .options-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .option-btn {
          padding: 0.6rem 1rem;
          background: var(--component-bg);
          border: 1px solid var(--border);
          border-radius: 100px;
          font-size: 0.85rem;
          transition: all 0.2s;
          color: var(--foreground);
        }

        .option-btn:hover {
          border-color: var(--primary);
          background: rgba(var(--primary-rgb), 0.1);
          transform: translateY(-2px);
          color: var(--primary);
        }

        .quick-options-fade {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          max-height: 120px;
          overflow-y: auto;
        }

        .chat-input-area {
          position: absolute;
          bottom: 2rem;
          left: 1rem;
          right: 1rem;
          padding: 0.5rem;
          border-radius: 100px;
          z-index: 30;
        }

        .input-box {
          display: flex;
          align-items: center;
        }

        .input-box input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--foreground);
          padding: 0.8rem 1.5rem;
          font-size: 1rem;
          outline: none;
        }

        .send-btn {
          width: 45px;
          height: 45px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: black;
          transition: transform 0.2s;
        }

        .send-btn:hover {
          transform: scale(1.05);
        }

        /* Log Panel */
        .log-panel {
          position: absolute;
          right: 1rem;
          bottom: 8rem;
          width: 320px;
          max-height: 300px;
          border-radius: 15px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 20;
        }

        .log-header {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--component-bg);
          cursor: grab;
          color: var(--foreground);
        }

        .log-header:active { cursor: grabbing; }

        .drag-indicator {
          display: flex;
          gap: 2px;
          margin-right: 8px;
        }

        .drag-indicator span {
          width: 3px;
          height: 3px;
          background: var(--primary);
          border-radius: 50%;
          opacity: 0.5;
        }

        .log-title {
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          opacity: 0.8;
          user-select: none;
        }

        .btn-clean-log { font-size: 0.7rem; opacity: 0.4; }

        .log-body {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          font-family: monospace;
          font-size: 0.7rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          background: var(--bg);
          color: var(--foreground);
        }

        .log-entry { opacity: 0.5; border-left: 2px solid var(--border); padding-left: 0.5rem; }
        .log-placeholder { opacity: 0.2; text-align: center; margin-top: 2rem; }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .settings-modal {
          width: 500px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 25px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .modal-header {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border);
        }

        .modal-body {
          padding: 2rem;
          overflow-y: auto;
          max-height: 70vh;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-item label { font-size: 0.9rem; font-weight: 600; }
        .form-item input {
          background: var(--card-bg);
          border: 1px solid var(--border);
          padding: 0.75rem 1rem;
          border-radius: 10px;
          color: var(--foreground);
          outline: none;
        }

        .form-item small { opacity: 0.4; font-size: 0.75rem; }

        /* Model Management UI Styles */
        .model-management-ui {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: var(--component-bg);
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--border);
        }

        .btn-sync {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.6rem;
          background: rgba(var(--primary-rgb), 0.1);
          border: 1px solid var(--primary);
          color: var(--primary);
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          transition: all 0.2s;
        }

        .btn-sync:hover:not(:disabled) {
          background: var(--primary);
          color: black;
        }

        .custom-model-adder {
          display: flex;
          gap: 0.5rem;
        }

        .custom-model-adder input {
          flex: 1;
          font-size: 0.85rem;
        }

        .custom-model-adder button {
          padding: 0 1rem;
          background: var(--border);
          border-radius: 8px;
          font-size: 0.8rem;
        }

        .model-chip-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          max-height: 120px;
          overflow-y: auto;
        }

        .model-chip {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.6rem;
          background: var(--component-bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 0.75rem;
          color: var(--foreground);
        }

        .model-chip span { cursor: pointer; }
        .model-chip.active {
          border-color: var(--primary);
          background: rgba(0, 242, 254, 0.05);
          color: var(--primary);
        }

        .model-chip button {
          opacity: 0.4;
          font-size: 1rem;
          line-height: 1;
        }

        .model-chip button:hover { opacity: 1; color: #ff4d4d; }

        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: flex-end;
        }

        .btn-save {
          background: var(--primary);
          color: black;
          padding: 0.75rem 2rem;
          border-radius: 12px;
          font-weight: 700;
        }

        .api-input-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .api-status-hint {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: 0.5rem;
        }

        .hint-tag {
          font-size: 0.65rem;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-weight: 600;
        }

        .hint-tag.force { background: rgba(var(--primary-rgb), 0.15); color: var(--primary); border: 1px solid var(--primary); }
        .hint-tag.raw { background: var(--component-bg); color: var(--muted-foreground); border: 1px solid var(--border); }
        .hint-tag.auto { background: rgba(var(--primary-rgb), 0.1); color: var(--primary); }

        .api-preview-box {
          background: var(--card-bg);
          border: 1px dashed var(--border);
          padding: 0.75rem;
          border-radius: 10px;
          margin-top: 0.5rem;
        }

        .preview-label { font-size: 0.7rem; opacity: 0.5; margin-bottom: 0.3rem; }
        .preview-url { font-family: monospace; font-size: 0.75rem; color: var(--primary); word-break: break-all; }

        .api-tips { font-size: 0.7rem; opacity: 0.5; margin-top: 0.3rem; line-height: 1.4; }
        .api-tips b { color: var(--primary); }

        .msg-attachments {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .att-item {
          max-width: 250px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--component-bg);
        }

        .att-img-preview {
          width: 100%;
          height: auto;
          display: block;
          max-height: 200px;
          object-fit: cover;
        }

        .att-file-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
          color: var(--foreground);
        }

        .input-attachments-preview {
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--component-bg);
          border-bottom: 1px solid var(--border);
          overflow-x: auto;
        }

        .att-preview-item {
          position: relative;
          width: 40px;
          height: 40px;
          background: var(--component-bg);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          flex-shrink: 0;
          color: var(--foreground);
        }

        .att-preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
        }

        .att-remove {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4d4d;
          color: white;
          border-radius: 50%;
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .attach-btn {
          padding: 0.5rem;
          opacity: 0.5;
          cursor: pointer;
          transition: all 0.2s;
        }

        .attach-btn:hover { opacity: 1; color: var(--primary); }

        .chat-input-area.dragging {
          border-color: var(--primary) !important;
          background: rgba(var(--primary-rgb), 0.05) !important;
          box-shadow: 0 0 30px rgba(var(--primary-rgb), 0.2) !important;
        }

        .input-box.big-data {
          flex-direction: column;
          padding: 0.5rem 0.5rem 0.75rem;
          gap: 0.5rem;
          align-items: stretch;
        }

        .input-box.big-data textarea {
          background: transparent;
          border: none;
          color: var(--foreground);
          padding: 0.5rem 0.75rem;
          font-size: 0.95rem;
          outline: none;
          resize: none;
          line-height: 1.5;
          min-height: 24px;
          max-height: 300px;
          scrollbar-width: thin;
        }

        .input-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 0.5rem;
        }

        .token-counter {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          color: var(--muted-foreground);
          font-family: monospace;
          background: var(--component-bg);
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
        }

        .input-actions-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .folder-select-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.8rem;
          background: var(--component-bg);
          border: 1px dashed var(--border);
          border-radius: 6px;
          font-size: 0.75rem;
          color: var(--muted-foreground);
          transition: all 0.2s;
          cursor: pointer;
        }

        .folder-select-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: rgba(var(--primary-rgb), 0.05);
        }

        .folder-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(var(--primary-rgb), 0.1);
          color: var(--primary);
          padding: 0.3rem 0.6rem;
          border-radius: 6px;
          border: 1px solid rgba(var(--primary-rgb), 0.2);
          font-size: 0.75rem;
        }

        .v-divider-v {
          width: 1px;
          height: 14px;
          background: var(--border);
          margin: 0 0.5rem;
        }

        @media (max-width: 1024px) {
          .log-panel { display: none; }
          .sidebar { width: 80px; }
          .sidebar span, .sidebar .btn-new-chat, .sidebar .list-label { display: none; }
          .sidebar-header, .sidebar-footer { align-items: center; }
        }
      `}</style>
    </div>
  );
}
