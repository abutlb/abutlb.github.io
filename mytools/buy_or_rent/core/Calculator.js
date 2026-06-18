// core/Calculator.js — محرك الحسابات المالية

export class Calculator {

    // ── قسط التمويل الشهري (صيغة PMT) ──────────────────────────
    static monthlyPayment(principal, annualRatePct, years) {
        if (principal <= 0) return 0;
        if (annualRatePct === 0) return principal / (years * 12);
        const r = annualRatePct / 100 / 12;
        const n = years * 12;
        return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    // ── المحاكاة السنوية الكاملة ─────────────────────────────────
    static run(inputs) {
        const {
            propertyPrice: price,
            downPaymentPct,
            loanYears,
            interestRate,
            monthlyRent:   mRent,
            rentIncrease,
            appreciation,
            holdYears,
            maintenance,
            closingCosts,
            sellingCosts,
            insuranceRate,
            investRate,
        } = inputs;

        const downPct        = downPaymentPct  / 100;
        const rentIncRate    = rentIncrease    / 100;
        const appreciateRate = appreciation    / 100;
        const maintRate      = maintenance     / 100;
        const closingRate    = closingCosts    / 100;
        const sellingRate    = sellingCosts    / 100;
        const insRate        = insuranceRate   / 100;
        const investRateAnn  = investRate      / 100;

        const downPayment    = price * downPct;
        const loanAmount     = price - downPayment;
        const monthly        = this.monthlyPayment(loanAmount, interestRate, loanYears);
        const closingCostAmt = price * closingRate;
        const years          = Math.min(Math.max(Math.round(holdYears), 1), 50);
        const r              = interestRate / 100 / 12;

        // ── محاكاة سنة بسنة ──
        let cumOwn        = downPayment + closingCostAmt;
        let cumRent       = 0;
        let curRent       = mRent;
        let remainingLoan = loanAmount;
        let totalInterest = 0;
        let totalMaint    = 0;
        let totalIns      = 0;

        const yearData = [];

        for (let y = 1; y <= years; y++) {
            // فوائد وأصل القرض خلال 12 شهر
            let yearInterest = 0;
            if (y <= loanYears && remainingLoan > 0) {
                for (let m = 0; m < 12; m++) {
                    const intAmt  = remainingLoan * r;
                    const prinAmt = Math.min(monthly - intAmt, remainingLoan);
                    yearInterest  += intAmt;
                    remainingLoan  = Math.max(0, remainingLoan - prinAmt);
                }
            }

            const yearMaint     = price * maintRate;
            const yearIns       = price * insRate;
            const ownershipYear = (y <= loanYears ? monthly * 12 : 0) + yearMaint + yearIns;

            totalInterest += yearInterest;
            totalMaint    += yearMaint;
            totalIns      += yearIns;
            cumOwn        += ownershipYear;

            const propValue = price * Math.pow(1 + appreciateRate, y);
            const equity    = propValue - remainingLoan;

            // الإيجار يرتفع سنوياً
            const monthlyRentThisYear = curRent;
            const yearRent = curRent * 12;
            cumRent       += yearRent;
            curRent       *= (1 + rentIncRate);

            yearData.push({
                year: y,
                monthly,
                monthlyRent: monthlyRentThisYear,
                cumOwn,
                cumRent,
                ownershipYear,
                yearRent,
                yearInterest,
                remainingLoan,
                propValue,
                equity,
            });
        }

        // ── القيم النهائية ──
        const futureValue    = price * Math.pow(1 + appreciateRate, years);
        const sellingCostAmt = futureValue * sellingRate;
        const netFutureVal   = futureValue - sellingCostAmt - remainingLoan;
        const netOwnership   = cumOwn - netFutureVal;

        // ── تكلفة الفرصة البديلة ──
        const invested    = downPayment + closingCostAmt;
        const investedFV  = invested * Math.pow(1 + investRateAnn, years);
        const investedGain = investedFV - invested;

        // ── صافي الثروة: تملك vs استثمار ──
        const netWorthOwn  = yearData.map(d => d.equity);
        const netWorthRent = yearData.map(d =>
            invested * Math.pow(1 + investRateAnn, d.year) - invested
        );

        // ── نقطة التعادل الحقيقية ──
        const breakEvenYear = this._findBreakeven(yearData, price, appreciateRate, sellingRate);

        // صافي تكلفة الإيجار: الإيجار المدفوع ناقص العائد من استثمار الدفعة المقدمة
        const netRent = cumRent - investedGain;

        return {
            inputs,
            price, downPayment, loanAmount, monthly, closingCostAmt,
            years, yearData,
            totalInterest, totalMaint, totalIns,
            futureValue, sellingCostAmt, netFutureVal,
            netOwnership, netRent, cumOwn, cumRent,
            invested, investedGain, investedFV,
            netWorthOwn, netWorthRent,
            breakEvenYear,
        };
    }

    // ── نقطة التعادل ────────────────────────────────────────────
    static _findBreakeven(yearData, price, appreciateRate, sellingRate) {
        for (const d of yearData) {
            const fv     = price * Math.pow(1 + appreciateRate, d.year);
            const netOwn = d.cumOwn - (fv * (1 - sellingRate) - d.remainingLoan);
            if (netOwn <= d.cumRent) return d.year;
        }
        return null;
    }
}
