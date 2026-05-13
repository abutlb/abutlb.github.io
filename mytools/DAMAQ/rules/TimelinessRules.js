// rules/TimelinessRules.js

export const TimelinessRules = {

    // البيانات لا تتجاوز عمراً معيناً بالأيام
    maxAge(column, maxDays, label = "") {
        return {
            id     : `max_age_${column}_${maxDays}`,
            type   : "timeliness",
            nameAr : `حداثة البيانات: "${column}" لا تتجاوز ${maxDays} يوم`,
            evaluate(data) {
                const now        = Date.now();
                const violations = [];

                data.forEach((row, idx) => {
                    const val = row[column];
                    if (!val) return;

                    const d = new Date(val);
                    if (isNaN(d.getTime())) return;

                    const ageDays = (now - d.getTime()) / 86400000;

                    if (ageDays > maxDays) {
                        violations.push({
                            rowIndex : idx,
                            value    : val,
                            ageDays  : Math.round(ageDays),
                            maxDays,
                            reason   : `البيانات عمرها ${Math.round(ageDays)} يوم — الحد الأقصى ${maxDays} يوم`
                        });
                    }
                });

                return {
                    passed  : violations.length === 0,
                    violations,
                    score   : +((1 - violations.length / data.length) * 100).toFixed(1),
                    summary : `${violations.length} سجل تجاوز حد ${maxDays} يوم`
                };
            }
        };
    },

    // تاريخ لا يكون في المستقبل
    notFuture(column) {
        return {
            id     : `not_future_${column}`,
            type   : "timeliness",
            nameAr : `لا يكون في المستقبل: "${column}"`,
            evaluate(data) {
                const now        = new Date();
                const violations = [];

                data.forEach((row, idx) => {
                    const val = row[column];
                    if (!val) return;

                    const d = new Date(val);
                    if (isNaN(d.getTime())) return;

                    if (d > now) {
                        violations.push({
                            rowIndex : idx,
                            value    : val,
                            reason   : `التاريخ ${val} في المستقبل`
                        });
                    }
                });

                return {
                    passed  : violations.length === 0,
                    violations,
                    score   : +((1 - violations.length / data.length) * 100).toFixed(1),
                    summary : `${violations.length} تاريخ في المستقبل`
                };
            }
        };
    },

    // تاريخ ضمن نطاق زمني محدد
    dateInRange(column, minDate, maxDate) {
        return {
            id     : `date_range_${column}`,
            type   : "timeliness",
            nameAr : `نطاق التاريخ: "${column}" بين ${minDate} و ${maxDate}`,
            evaluate(data) {
                const min        = new Date(minDate);
                const max        = new Date(maxDate);
                const violations = [];

                data.forEach((row, idx) => {
                    const val = row[column];
                    if (!val) return;

                    const d = new Date(val);
                    if (isNaN(d.getTime())) return;

                    if (d < min || d > max) {
                        violations.push({
                            rowIndex : idx,
                            value    : val,
                            reason   : `التاريخ خارج النطاق (${minDate} — ${maxDate})`
                        });
                    }
                });

                return {
                    passed  : violations.length === 0,
                    violations,
                    score   : +((1 - violations.length / data.length) * 100).toFixed(1),
                    summary : `${violations.length} تاريخ خارج النطاق المحدد`
                };
            }
        };
    }
};
