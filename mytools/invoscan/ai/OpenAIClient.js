// ai/OpenAIClient.js — OpenAI API (ChatGPT)
import { INVOICE_PROMPT } from './BaseAIClient.js';

const API_URL = 'https://api.openai.com/v1/chat/completions';

export class OpenAIClient {
    static async extract(rawText, apiKey, model = 'gpt-4o-mini') {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                response_format: { type: 'json_object' },
                temperature: 0,
                max_tokens:  2048,
                messages: [
                    {
                        role:    'system',
                        content: 'You are an invoice data extraction expert. Always respond with valid JSON only.',
                    },
                    {
                        role:    'user',
                        content: INVOICE_PROMPT + rawText.slice(0, 14000),
                    },
                ],
            }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.error?.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (!text) throw new Error('لم يُرجع النموذج نتيجة');
        return JSON.parse(text);
    }

    static async test(apiKey, model = 'gpt-4o-mini') {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                max_tokens: 5,
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
