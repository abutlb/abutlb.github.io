// ai/AIRouter.js — يختار المزود المناسب ويشغّل الاستخراج
import { GeminiClient } from './GeminiClient.js';
import { OpenAIClient } from './OpenAIClient.js';
import { ClaudeClient } from './ClaudeClient.js';
import { lsKey, lsModel, LS_PROVIDER } from './BaseAIClient.js';

const CLIENTS = {
    gemini: GeminiClient,
    openai: OpenAIClient,
    claude: ClaudeClient,
};

export class AIRouter {
    // هل هناك مزود مفعّل (مفتاح + مزود محدد)؟
    static isEnabled() {
        const provider = localStorage.getItem(LS_PROVIDER);
        return !!(provider && localStorage.getItem(lsKey(provider)));
    }

    // استخراج بيانات الفاتورة بالـ AI
    static async extract(rawText) {
        const provider = localStorage.getItem(LS_PROVIDER);
        if (!provider) throw new Error('لم يُحدَّد مزود AI');

        const apiKey = localStorage.getItem(lsKey(provider));
        if (!apiKey) throw new Error(`لا يوجد مفتاح لـ ${provider}`);

        const model  = localStorage.getItem(lsModel(provider)) || undefined;
        const client = CLIENTS[provider];
        if (!client) throw new Error(`مزود غير معروف: ${provider}`);

        return client.extract(rawText, apiKey, model);
    }

    // اختبار الاتصال للمزود الحالي
    static async test(provider, apiKey, model) {
        const client = CLIENTS[provider];
        if (!client) throw new Error(`مزود غير معروف: ${provider}`);
        return client.test(apiKey, model);
    }
}
