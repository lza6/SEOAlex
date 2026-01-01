export type ContentType = "blog" | "landing_page" | "email" | "funnel";

export interface TaskItem {
    id: string;
    name: string;
    status: "pending" | "running" | "done";
    details?: string;
}

export interface AgentResponse {
    message: string;
    tasks?: TaskItem[];
    options?: string[];
    suggestedAction?: string;
}

export class SEOAlexAgent {
    private apiConfig: { url: string; key: string };
    private history: any[] = [];
    private taskList: TaskItem[] = [];

    constructor(config: { url: string; key: string } = { url: "https://api.openai.com/v1", key: "" }) {
        this.apiConfig = config;
    }

    /**
     * 导师模式下的首次交互：征集意见并生成计划
     */
    async mentorInit(prompt: string, domain: string): Promise<AgentResponse> {
        // 模拟上下文压缩：将之前的对话进行摘要（Roo Code 风格）
        this.compressContext();

        // 构建初始任务清单
        this.taskList = [
            { id: "1", name: "域名深度扫描与 SEO 指标分析", status: "pending" },
            { id: "2", name: "竞品关键词流量挖掘 (Semrush 模拟)", status: "pending" },
            { id: "3", name: "编写高转化率落地页文案大纲", status: "pending" },
            { id: "4", name: "生成多渠道内容营销日历", status: "pending" },
        ];

        return {
            message: `你好！我是你的 SEO 优化导师。针对你提出的“${prompt}”以及域名“${domain}”，我已经初步规划了一套专业的落地执行方案。

在开始之前，我需要确认：
1. 这个方案是否涵盖了你目前最关注的维度？
2. 你是否希望在生成的文案中强调特定的品牌基调？

以下是我为你制定的初步任务列表，请审阅：`,
            tasks: this.taskList,
            options: ["看起来很棒，立即开始！", "能增加一些社交媒体文案的任务吗？", "我想调整任务 2 的逻辑"],
        };
    }

    /**
     * 执行特定任务
     */
    async executeTask(taskId: string): Promise<void> {
        const task = this.taskList.find(t => t.id === taskId);
        if (task) {
            task.status = "running";
            // 模拟执行过程
            await new Promise(resolve => setTimeout(resolve, 3000));
            task.status = "done";
        }
    }

    /**
     * 模拟上下文自动压缩
     */
    private compressContext() {
        console.log("[CONTEXT] 正在应用上下文压缩算法 (Token 节省模式)...");
        // 逻辑：保留最后 5 条消息，并将其余消息摘要为一个 System Instruction
        if (this.history.length > 10) {
            console.log("[CONTEXT] 压缩成功：旧消息已合并为上下文摘要。");
        }
    }

    /**
     * 模拟日志输出给开发者
     */
    getDeveloperLogs(): string[] {
        return [
            `[API] 调用网关: ${this.apiConfig.url}`,
            `[LOG] 上下文压缩比例: 65%`,
            `[LOG] 正在分配任务资源包...`,
            `[STATUS] Agent 状态: 等待用户指令`,
        ];
    }
}
