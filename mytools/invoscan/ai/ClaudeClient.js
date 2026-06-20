// ai/ClaudeClient.js — Anthropic Claude API
import { INVOICE_PROMPT } from './BaseAIClient.js';

const API_URL = 'https://api.anthropic.com/v1/messages';

export class ClaudeClient {
    static async extract(rawText, apiKey, model = 'claude-haiku-4-5-20251001') {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type':                          'application/json',
                'x-api-key':                             apiKey,
                'anthropic-version':                     '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
                model,
                max_tokens: 2048,
                messages: [{
                    role:    'user',
                    content: INVOICE_PROMPT + rawText.slice(0, 14000),
                }],
            }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.error?.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const text = data?.content?.[0]?.text;
        if (!text) throw new Error('لم يُرجع النموذج نتيجة');

        // استخراج JSON من الرد (قد يحتوي markdown)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('الرد لا يحتوي JSON صحيح');
        return JSON.parse(jsonMatch[0]);
    }

    static async test(apiKey, model = 'claude-haiku-4-5-20251001') {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type':                          'application/json',
                'x-api-key':                             apiKey,
                'anthropic-version':                     '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
                model,
                max_tokens: 10,
                messages: [{ role: 'user', content: 'say OK' }],
            }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.error?.message || `HTTP ${res.status}`);
        }
        return true;
    }
}
