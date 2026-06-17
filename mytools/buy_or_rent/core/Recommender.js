// core/Recommender.js — منطق التوصيات وقرار الشراء/الإيجار

import { fmtK } from "../utils/Formatters.js";

export class Recommender {

    // ── الدرجة: 0 = إيجار بوضوح، 100 = تملك بوضوح ──────────────
    static calcScore(netOwnership, netRent) {
        const denom = Math.abs(netOwnership) + Math.abs(netRent);
        if (denom === 0) return 50;
        return Math.max(0, Math.min(100,
            50 + (netRent - netOwnership) / denom * 100
        ));
    }

    static analyze(base) {
        const { netOwnership, netRent, futureValue, investedGain,
                downPayment, years, breakEvenYear } = base;

        const score = this.calcScore(netOwnership, netRent);
        const diff  = netOwnership - netRent;

        let verdict, icon, title, text;

        if (score > 62) {
            verdict = 'buy';
            icon    = '🏠';
            title   = 'التملك هو الخيار الأمثل';
            text    = `صافي تكلفة التملك (${fmtK(netOwnership)}) أقل بـ ${fmtK(Math.abs(diff))} ` +
                      `عن الإيجار خلال ${years} سنة. ستمتلك عقاراً بقيمة ${fmtK(futureValue)}.` +
                      (breakEvenYear ? ` نقطة التعادل في السنة ${breakEvenYear}.` : '');
        } else if (score < 38) {
            verdict = 'rent';
            icon    = '🔑';
            title   = 'الإيجار أوفر في وضعك الحالي';
            text    = `تكلفة الإيجار (${fmtK(netRent)}) أقل بـ ${fmtK(Math.abs(diff))}. ` +
                      `استثمار دفعتك المقدمة (${fmtK(downPayment)}) قد يعود بـ ${fmtK(investedGain)} إضافية.`;
        } else {
            verdict = 'neutral';
            icon    = '⚖️';
            title   = 'الخياران متقاربان';
            text    = `الفرق المالي بسيط (${fmtK(Math.abs(diff))}). القرار يعتمد على ` +
                      `الاستقرار الشخصي، الخطط العائلية، والأهداف طويلة المدى.`;
        }

        const label = score > 70  ? 'التملك أفضل بوضوح'
                    : score > 55  ? 'ميل نحو التملك'
                    : score > 45  ? 'متقاربان'
                    : score > 30  ? 'ميل نحو الإيجار'
                    :               'الإيجار أفضل بوضوح';

        return { verdict, icon, title, text, score, label, diff };
    }
}
