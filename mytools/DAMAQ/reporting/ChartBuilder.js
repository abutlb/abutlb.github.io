// reporting/ChartBuilder.js
// يرسم مباشرة على Canvas — بدون مكتبات خارجية

export class ChartBuilder {

    // ── Bar Chart ────────────────────────────────────────────────
    static drawBar(canvas, labels, values, options = {}) {
        const ctx    = canvas.getContext("2d");
        const W      = canvas.width;
        const H      = canvas.height;
        const pad    = options.padding || 50;
        const color  = options.color  || "#3B82F6";
        const title  = options.title  || "";

        ctx.clearRect(0, 0, W, H);

        // خلفية
        ctx.fillStyle = options.bgColor || "#FFFFFF";
        ctx.fillRect(0, 0, W, H);

        const max    = Math.max(...values, 1);
        const barW   = (W - pad * 2) / labels.length;
        const chartH = H - pad * 2;

        // العنوان
        if (title) {
            ctx.fillStyle = "#1F2937";
            ctx.font      = "bold 14px Arial";
            ctx.textAlign = "center";
            ctx.fillText(title, W / 2, 20);
        }

        // الأعمدة
        labels.forEach((label, i) => {
            const barH  = (values[i] / max) * chartH;
            const x     = pad + i * barW + barW * 0.1;
            const y     = H - pad - barH;
            const bW    = barW * 0.8;

            // الظل
            ctx.shadowColor   = "rgba(0,0,0,0.1)";
            ctx.shadowBlur    = 4;
            ctx.shadowOffsetY = 2;

            // العمود
            ctx.fillStyle = Array.isArray(color) ? color[i % color.length] : color;
            ctx.beginPath();
            ctx.roundRect?.(x, y, bW, barH, 4) ||
            ctx.rect(x, y, bW, barH);
            ctx.fill();

            ctx.shadowColor = "transparent";

            // القيمة فوق العمود
            ctx.fillStyle = "#374151";
            ctx.font      = "11px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
                values[i] % 1 === 0 ? values[i] : values[i].toFixed(1),
                x + bW / 2,
                y - 5
            );

            // التسمية أسفل
            ctx.fillStyle = "#6B7280";
            ctx.font      = "10px Arial";
            ctx.textAlign = "center";
            const shortLabel = String(label).length > 10
                ? String(label).slice(0, 10) + "…"
                : String(label);
            ctx.fillText(shortLabel, x + bW / 2, H - pad + 15);
        });

        // خط المحور X
        ctx.strokeStyle = "#E5E7EB";
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(pad, H - pad);
        ctx.lineTo(W - pad, H - pad);
        ctx.stroke();
    }

    // ── Donut Chart ──────────────────────────────────────────────
    static drawDonut(canvas, labels, values, options = {}) {
        const ctx    = canvas.getContext("2d");
        const W      = canvas.width;
        const H      = canvas.height;
        const cx     = W / 2;
        const cy     = H / 2;
        const radius = Math.min(W, H) / 2 - 40;
        const inner  = radius * 0.55;
        const title  = options.title || "";

        const COLORS = options.colors || [
            "#3B82F6","#10B981","#F59E0B","#EF4444",
            "#8B5CF6","#EC4899","#14B8A6","#F97316"
        ];

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = options.bgColor || "#FFFFFF";
        ctx.fillRect(0, 0, W, H);

        const total = values.reduce((a, b) => a + b, 0);
        if (total === 0) return;

        let startAngle = -Math.PI / 2;

        // رسم الشرائح
        values.forEach((val, i) => {
            const slice = (val / total) * Math.PI * 2;
            const end   = startAngle + slice;
            const mid   = startAngle + slice / 2;

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle, end);
            ctx.closePath();
            ctx.fillStyle = COLORS[i % COLORS.length];
            ctx.fill();

            // تسمية الشريحة (إذا كبيرة بما يكفي)
            if (slice > 0.3) {
                const lx = cx + (radius * 0.75) * Math.cos(mid);
                const ly = cy + (radius * 0.75) * Math.sin(mid);
                ctx.fillStyle = "#FFFFFF";
                ctx.font      = "bold 11px Arial";
                ctx.textAlign = "center";
                ctx.fillText(
                    `${((val / total) * 100).toFixed(0)}%`,
                    lx, ly
                );
            }

            startAngle = end;
        });

        // الثقب الداخلي
        ctx.beginPath();
        ctx.arc(cx, cy, inner, 0, Math.PI * 2);
        ctx.fillStyle = options.bgColor || "#FFFFFF";
        ctx.fill();

        // النص في المنتصف
        if (title) {
            ctx.fillStyle = "#1F2937";
            ctx.font      = "bold 13px Arial";
            ctx.textAlign = "center";
            ctx.fillText(title, cx, cy - 8);
            ctx.fillStyle = "#6B7280";
            ctx.font      = "11px Arial";
            ctx.fillText(`${total} إجمالي`, cx, cy + 12);
        }

        // Legend
        const legendY = H - 30;
        const itemW   = W / Math.min(labels.length, 4);
        labels.slice(0, 4).forEach((label, i) => {
            const lx = (i % 4) * itemW + 10;
            ctx.fillStyle = COLORS[i % COLORS.length];
            ctx.fillRect(lx, legendY, 12, 12);
            ctx.fillStyle = "#374151";
            ctx.font      = "10px Arial";
            ctx.textAlign = "left";
            const short = String(label).length > 8
                ? String(label).slice(0, 8) + "…"
                : String(label);
            ctx.fillText(short, lx + 16, legendY + 10);
        });
    }

    // ── Gauge Chart (للدرجة الكلية) ─────────────────────────────
    static drawGauge(canvas, score, options = {}) {
        const ctx  = canvas.getContext("2d");
        const W    = canvas.width;
        const H    = canvas.height;
        const cx   = W / 2;
        const cy   = H * 0.65;
        const r    = Math.min(W, H) * 0.38;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = options.bgColor || "#FFFFFF";
        ctx.fillRect(0, 0, W, H);

        // خلفية القوس
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI, 0);
        ctx.lineWidth   = 20;
        ctx.strokeStyle = "#E5E7EB";
        ctx.stroke();

        // تدرج اللون حسب الدرجة
        const getColor = s =>
            s >= 80 ? "#10B981" :
            s >= 60 ? "#F59E0B" :
            s >= 40 ? "#F97316" : "#EF4444";

        // القوس الملون
        const angle = Math.PI + (score / 100) * Math.PI;
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI, angle);
        ctx.strokeStyle = getColor(score);
        ctx.lineWidth   = 20;
        ctx.lineCap     = "round";
        ctx.stroke();

        // الإبرة
        const needleAngle = Math.PI + (score / 100) * Math.PI;
        const nx = cx + (r - 10) * Math.cos(needleAngle);
        const ny = cy + (r - 10) * Math.sin(needleAngle);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = "#1F2937";
        ctx.lineWidth   = 3;
        ctx.lineCap     = "round";
        ctx.stroke();

        // نقطة المركز
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#1F2937";
        ctx.fill();

        // الدرجة
        ctx.fillStyle = getColor(score);
        ctx.font      = `bold ${W * 0.12}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(score, cx, cy - r * 0.15);

        // التسمية
        ctx.fillStyle = "#6B7280";
        ctx.font      = `12px Arial`;
        ctx.fillText(options.label || "درجة الجودة", cx, cy + 25);

        // 0 و 100
        ctx.fillStyle = "#9CA3AF";
        ctx.font      = "10px Arial";
        ctx.textAlign = "left";
        ctx.fillText("0", cx - r - 5, cy + 8);
        ctx.textAlign = "right";
        ctx.fillText("100", cx + r + 5, cy + 8);
    }

    // ── Heatmap (للـ Null Distribution) ─────────────────────────
    static drawHeatmap(canvas, columns, nullPcts, options = {}) {
        const ctx  = canvas.getContext("2d");
        const W    = canvas.width;
        const H    = canvas.height;
        const pad  = 10;
        const cellH = Math.max(20, (H - pad * 2) / columns.length);
        const labelW = 140;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, W, H);

        // العنوان
        ctx.fillStyle = "#1F2937";
        ctx.font      = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(options.title || "توزيع القيم الفارغة", W / 2, 16);

        columns.forEach((col, i) => {
            const pct  = nullPcts[i] || 0;
            const y    = pad + 20 + i * cellH;
            const barW = (W - labelW - pad * 2) * (pct / 100);

            // تسمية العمود
            ctx.fillStyle = "#374151";
            ctx.font      = "10px Arial";
            ctx.textAlign = "right";
            const short = col.length > 18 ? col.slice(0, 18) + "…" : col;
            ctx.fillText(short, labelW, y + cellH * 0.65);

            // خلفية الشريط
            ctx.fillStyle = "#F3F4F6";
            ctx.fillRect(labelW + pad, y + 2, W - labelW - pad * 2, cellH - 4);

            // الشريط الملون
            const color =
                pct === 0   ? "#10B981" :
                pct < 10    ? "#34D399" :
                pct < 30    ? "#F59E0B" :
                pct < 70    ? "#F97316" : "#EF4444";

            if (barW > 0) {
                ctx.fillStyle = color;
                ctx.fillRect(labelW + pad, y + 2, barW, cellH - 4);
            }

            // النسبة
            ctx.fillStyle = "#6B7280";
            ctx.font      = "9px Arial";
            ctx.textAlign = "left";
            ctx.fillText(`${pct}%`, labelW + pad + barW + 4, y + cellH * 0.65);
        });
    }

    // ── تحويل Canvas → Base64 ────────────────────────────────────
    static toBase64(canvas) {
        return canvas.toDataURL("image/png");
    }

    // ── إنشاء Canvas خارج الـ DOM ────────────────────────────────
    static createOffscreen(width, height) {
        const canvas    = document.createElement("canvas");
        canvas.width    = width;
        canvas.height   = height;
        return canvas;
    }
}
