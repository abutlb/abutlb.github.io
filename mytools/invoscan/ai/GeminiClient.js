// ai/GeminiClient.js — Gemini API (Google)
import { INVOICE_PROMPT } from './BaseAIClient.js';

const API_URL = (model, key) =>
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

const SCHEMA = {
    type: 'object',
    properties: {
        invoiceNumber: { type: 'string' }, date: { type: 'string' },
        dueDate: { type: 'string' }, supplier: { type: 'string' },
        customer: { type: 'string' }, vatNumber: { type: 'string' },
        poNumber: { type: 'string' }, currency: { type: 'string' },
        subtotal: { type: 'string' }, tax: { type: 'string' },
        discount: { type: 'string' }, total: { type: 'string' },
        paymentTerms: { type: 'string' }, notes: { type: 'string' },
        items: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    description: { type: 'string' }, qty: { type: 'string' },
                    unitPrice: { type: 'string' },   total: { type: 'string' },
                },
            },
        },
    },
};

export class GeminiClient {
    static async extract(rawText, apiKey, model = 'gemini-2.0-flash') {
        const res = await fetch(API_URL(model, apiKey), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: INVOICE_PROMPT + rawText.slice(0, 14000) }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema:   SCHEMA,
                    temperature: 0, maxOutputTokens: 2048,
                },
            }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.error?.message || `HTTP ${res.status}`);
        }
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('لم يُرجع النموذج نتيجة');
        return JSON.parse(text);
    }

    static async test(apiKey, model = 'gemini-2.0-flash') {
        const res = await fetch(API_URL(model, apiKey), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: 'say OK' }] }],
                generationConfig: { maxOutputTokens: 5 },
            }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.error?.message || `HTTP ${res.status}`);
        }
        return true;
    }
}
