// reporting/PDFExporter.js
export class PDFExporter {

    // الطريقة الأولى: Print Dialog (بدون مكتبات)
    static printToPDF(htmlContent, fileName = "report.pdf") {
        const printWindow = window.open("", "_blank", "width=1100,height=800");

        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // انتظر تحميل الصور ثم افتح Print Dialog
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 800);
        };
    }

    // الطريقة الثانية: تحميل كـ HTML (يفتحه المستخدم ويطبعه)
    static downloadHTML(htmlContent, fileName = "report.html") {
        const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement("a"), {
            href    : url,
            download: fileName
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // الطريقة الثالثة: iframe مخفي للطباعة الصامتة
    static silentPrint(htmlContent) {
        const iframe = document.createElement("iframe");
        iframe.style.cssText = "position:fixed; top:-9999px; left:-9999px;";
        document.body.appendChild(iframe);

        iframe.contentDocument.write(htmlContent);
        iframe.contentDocument.close();

        iframe.onload = () => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => document.body.removeChild(iframe), 2000);
        };
    }
}
