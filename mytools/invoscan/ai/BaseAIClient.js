// ai/BaseAIClient.js — الواجهة المشتركة لجميع مزودي الـ AI

export const INVOICE_PROMPT = `أنت نظام متخصص في استخراج بيانات الفواتير باللغتين العربية والإنجليزية.
استخرج البيانات التالية من نص الفاتورة وأعدها كـ JSON صحيح فقط بدون أي نص إضافي:

{
  "invoiceNumber": "رقم الفاتورة",
  "date": "تاريخ الفاتورة YYYY-MM-DD فقط",
  "dueDate": "تاريخ الاستحقاق YYYY-MM-DD أو فارغ",
  "supplier": "اسم الشركة المُصدِرة للفاتورة",
  "customer": "اسم العميل",
  "vatNumber": "الرقم الضريبي",
  "poNumber": "رقم أمر الشراء أو فارغ",
  "currency": "رمز العملة SAR/USD/...",
  "subtotal": "المجموع قبل الضريبة — أرقام فقط",
  "tax": "قيمة الضريبة — أرقام فقط",
  "discount": "الخصم — أرقام فقط",
  "total": "الإجمالي الكلي — أرقام فقط",
  "paymentTerms": "شروط الدفع أو فارغ",
  "notes": "ملاحظات أو فارغ",
  "items": [
    {
      "description": "وصف البند",
      "qty": "الكمية",
      "unitPrice": "سعر الوحدة",
      "total": "الإجمالي"
    }
  ]
}

قواعد: الحقول الغائبة = "" — الأرقام بدون فواصل أو رموز عملة — items يحتوي البنود الفعلية فقط.

نص الفاتورة:
`;

export const PROVIDERS = {
    gemini: {
        id:       'gemini',
        name:     'Gemini',
        company:  'Google',
        icon:     'fa-google',
        color:    '#4285f4',
        free:     true,
        models: [
            { id: 'gemini-2.0-flash',   label: 'Flash 2.0 — موصى به (مجاني)' },
            { id: 'gemini-1.5-pro',     label: 'Pro 1.5 — أعلى دقة' },
            { id: 'gemini-2.0-flash-lite', label: 'Flash Lite — أسرع (مجاني)' },
        ],
        keyUrl:   'https://aistudio.google.com/app/apikey',
        keyHint:  'AIzaSy...',
    },
    openai: {
        id:      'openai',
        name:    'ChatGPT',
        company: 'OpenAI',
        icon:    'fa-robot',
        color:   '#10a37f',
        free:    false,
        models: [
            { id: 'gpt-4o-mini', label: 'GPT-4o mini — موصى به (رخيص)' },
            { id: 'gpt-4o',      label: 'GPT-4o — أعلى دقة' },
        ],
        keyUrl:  'https://platform.openai.com/api-keys',
        keyHint: 'sk-...',
    },
    claude: {
        id:      'claude',
        name:    'Claude',
        company: 'Anthropic',
        icon:    'fa-brain',
        color:   '#d97706',
        free:    false,
        models: [
            { id: 'claude-haiku-4-5-20251001', label: 'Haiku — أسرع وأرخص' },
            { id: 'claude-sonnet-4-6',         label: 'Sonnet — أعلى دقة' },
        ],
        keyUrl:  'https://console.anthropic.com/settings/keys',
        keyHint: 'sk-ant-...',
    },
};

export function lsKey(provider)  { return `invoscan-key-${provider}`; }
export function lsModel(provider){ return `invoscan-model-${provider}`; }
export const   LS_PROVIDER       = 'invoscan-ai-provider';
