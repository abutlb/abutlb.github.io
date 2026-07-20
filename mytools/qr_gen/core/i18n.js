// core/i18n.js
// نظام تعدد اللغات (عربي/إنجليزي) — قاموس ترجمة + مساعد تبديل مع حفظ الاختيار

export const translations = {
    ar: {
        pageTitle: "مولّد QR Code مجاني أونلاين — فردي ودفعات من Excel/CSV",
        metaDescription: "أنشئ رموز QR مجاناً للرابط، النص، WiFi، بطاقة الاتصال والموقع. يدعم توليد دفعات من Excel/CSV وتحميل PNG أو SVG أو ZIP.",

        appTitle: "QR Gen",
        appSubtitle: "مولّد رموز QR — فردي ودُفعات",
        heroDescription: "أنشئ رمز QR واحداً أو ولّد مئات الرموز دفعة واحدة من Excel/CSV — مباشرة من المتصفح وبخصوصية كاملة.",
        privacyNote: "الخصوصية: تتم معالجة البيانات داخل المتصفح فقط، ولا يتم رفع الروابط أو الملفات إلى خادم خارجي.",

        tabSingle: "رمز واحد",
        tabBatch: "توليد دفعات",
        tabAbout: "عن الأداة",

        // ── محتوى ──
        contentTitle: "المحتوى",
        qrTypeLabel: "نوع رمز QR",
        typeLink: "🔗 نص / رابط",
        typeWifi: "📶 شبكة WiFi",
        typeVcard: "👤 بطاقة اتصال",
        typeEmail: "📧 بريد إلكتروني",
        typeSms: "💬 رسالة نصية",
        typeTel: "📞 رقم هاتف",
        typeGeo: "📍 موقع جغرافي",

        fieldContent: "الرابط أو النص",
        fieldContentPh: "https://example.com أو أي نص...",
        fieldSsid: "اسم الشبكة (SSID)",
        fieldSsidPh: "MyNetwork",
        fieldPassword: "كلمة المرور",
        fieldPasswordPh: "••••••••",
        fieldSecurity: "نوع الأمان",
        secWpa: "WPA / WPA2",
        secWep: "WEP",
        secNone: "بدون كلمة مرور",
        fieldName: "الاسم الكامل",
        fieldPhone: "رقم الهاتف",
        fieldEmail: "البريد الإلكتروني",
        fieldOrg: "الجهة (اختياري)",
        fieldJobTitle: "المسمى الوظيفي (اختياري)",
        fieldEmailTo: "البريد الإلكتروني",
        fieldSubject: "الموضوع (اختياري)",
        fieldBody: "نص الرسالة (اختياري)",
        fieldMessage: "نص الرسالة",
        fieldLat: "خط العرض (Latitude)",
        fieldLng: "خط الطول (Longitude)",

        // ── الألوان ──
        colorsTitle: "الألوان",
        dotColorLabel: "لون النقاط",
        bgColorLabel: "لون الخلفية",
        transparentLabel: "شفاف",

        // ── الشكل والإعدادات ──
        shapeTitle: "الشكل والإعدادات",
        dotShapeLabel: "شكل النقاط",
        shapeSquare: "⬛ مربعات",
        shapeDots: "⚫ نقاط",
        shapeRounded: "🔵 مدوّر",
        shapeExtraRounded: "🟣 مدوّر كامل",
        shapeClassy: "💎 كلاسيك",
        shapeClassyRounded: "✨ كلاسيك مدوّر",
        roundedCornersLabel: "زوايا مدوّرة",
        errorLevelLabel: "مستوى تصحيح الخطأ",
        errorLow: "منخفض (L) — 7%",
        errorMedium: "متوسط (M) — 15%",
        errorHigh: "عالي (Q) — 25%",
        errorVeryHigh: "مرتفع جداً (H) — 30%",
        sizeLabel: "حجم التصدير",
        marginLabel: "الهامش",
        marginNone: "بدون",
        marginLarge: "كبير",

        // ── الشعار ──
        logoTitle: "الشعار (logo)",
        logoDropText: "اضغط لرفع اللوغو",
        logoDropHint: "PNG بخلفية شفافة — الأفضل",
        logoRemove: "إزالة الشعار",

        // ── المعاينة والتصدير ──
        previewEmpty: "أدخل محتوى لعرض رمز QR",
        statError: "الخطأ",
        statSize: "الحجم",
        statLogo: "اللوغو",
        statShape: "الشكل",
        downloadTitle: "تحميل",
        dlPng: "تحميل PNG",
        dlPngHint: "شفاف",
        dlSvg: "تحميل SVG",
        dlSvgHint: "متجه",
        dlJpg: "تحميل JPG",
        dlJpgHint: "صغير",
        shareWhatsapp: "مشاركة عبر واتساب",

        // ── تحقق وأخطاء ──
        errNoContent: "أدخل رابطاً أو نصاً أولاً.",
        errIncompleteLink: 'الرابط غير مكتمل. مثال صحيح: https://example.com',
        errNoFile: "يرجى اختيار ملف Excel أو CSV أولاً.",
        errNoContentColumn: "يرجى اختيار عمود الرابط أو المحتوى.",
        errEmptyFile: "الملف لا يحتوي على بيانات قابلة للتوليد.",
        warnLowContrast: "تنبيه: التباين بين لون النقاط والخلفية منخفض، وقد يصعب مسح رمز QR.",
        warnLargeLogo: "تنبيه: الشعار كبير وقد يؤثر على قابلية قراءة رمز QR. استخدم مستوى تصحيح خطأ عالياً.",
        toastDownloaded: "تم تحميل رمز QR",

        // ── الدفعات ──
        listTitle: "قائمة المحتوى",
        listDescription: "كل عنصر بين الفواصل = رمز QR واحد (روابط، نصوص، أرقام...)",
        delimiterLabel: "الفاصل بين العناصر",
        delimNewline: "سطر جديد",
        delimComma: "فاصلة ( , )",
        delimSemicolon: "فاصلة منقوطة ( ; )",
        listPlaceholder: "https://example.com\nhttps://google.com\nنص تجريبي",
        generatePreview: "توليد المعاينة",
        importExcelTitle: "أو استورد من Excel / CSV",
        excelDropText: "اضغط لرفع ملف",
        excelContentColLabel: "عمود الرابط / المحتوى",
        excelNameColLabel: "عمود اسم الملف (اختياري)",
        excelNameColNone: "— بدون (ترقيم تلقائي) —",
        generateFromFile: "توليد من الملف",
        shapeColorsTitle: "الشكل والألوان",
        formatLabel: "صيغة الملفات",
        previewCountTitle: "المعاينة",
        downloadZip: "تحميل الكل كـ ZIP",
        batchEmpty: "الصق قائمة أو استورد ملف Excel ثم اضغط توليد",
        toastGenerated: (n) => `تم توليد ${n} رمز QR بنجاح.`,
        toastZipDone: (n) => `تم تحميل ${n} رمز داخل ملف ZIP`,
        generatingZip: (done, total) => `جاري التحميل ${done}/${total}...`,
        generatingCodes: "جاري توليد الرموز...",
        generationComplete: "اكتمل التوليد.",
        toastExcelLoaded: (n) => `تم تحميل ${n} صف — حدّد الأعمدة ثم اضغط توليد`,
        toastNoValidRows: "لا توجد قيم صالحة في عمود المحتوى المختار",
        toastEmptyFile2: "الملف فارغ أو لا يحتوي بيانات",
        toastFileReadError: (msg) => `خطأ في قراءة الملف: ${msg}`,
        toastExportError: (msg) => `خطأ في التصدير: ${msg}`,

        // ── عن الأداة ──
        aboutName: "عبدالله التويجري",
        aboutRole: "محلل بيانات · ذكاء أعمال · مطوّر Python & Django",
        aboutBio: "QR Gen أداة مجانية لتوليد رموز QR بسرعة، سواء لرمز واحد أو لمئات الرموز دفعة واحدة من Excel/CSV. تعمل مباشرة داخل المتصفح وتركّز على الخصوصية وسهولة الاستخدام.",
        aboutGithub: "GitHub",
        aboutLinkedin: "LinkedIn",
        aboutEmail: "راسلني",
        aboutBack: "عودة إلى البورتفوليو",
    },

    en: {
        pageTitle: "Free QR Code Generator — Single and Bulk from Excel/CSV",
        metaDescription: "Create free QR codes for links, text, WiFi, contact cards and locations. Supports bulk generation from Excel/CSV and downloads as PNG, SVG or ZIP.",

        appTitle: "QR Gen",
        appSubtitle: "QR code generator — single and batch",
        heroDescription: "Create a single QR code or generate hundreds in bulk from Excel/CSV — directly in your browser with full privacy.",
        privacyNote: "Privacy: All data is processed locally in your browser. Links and files are not uploaded to any external server.",

        tabSingle: "Single QR",
        tabBatch: "Bulk QR",
        tabAbout: "About",

        contentTitle: "Content",
        qrTypeLabel: "QR code type",
        typeLink: "🔗 Text / Link",
        typeWifi: "📶 WiFi network",
        typeVcard: "👤 Contact card",
        typeEmail: "📧 Email",
        typeSms: "💬 Text message",
        typeTel: "📞 Phone number",
        typeGeo: "📍 Location",

        fieldContent: "Link or text",
        fieldContentPh: "https://example.com or any text...",
        fieldSsid: "Network name (SSID)",
        fieldSsidPh: "MyNetwork",
        fieldPassword: "Password",
        fieldPasswordPh: "••••••••",
        fieldSecurity: "Security type",
        secWpa: "WPA / WPA2",
        secWep: "WEP",
        secNone: "No password",
        fieldName: "Full name",
        fieldPhone: "Phone number",
        fieldEmail: "Email",
        fieldOrg: "Organization (optional)",
        fieldJobTitle: "Job title (optional)",
        fieldEmailTo: "Email",
        fieldSubject: "Subject (optional)",
        fieldBody: "Message body (optional)",
        fieldMessage: "Message text",
        fieldLat: "Latitude",
        fieldLng: "Longitude",

        colorsTitle: "Colors",
        dotColorLabel: "Dot color",
        bgColorLabel: "Background color",
        transparentLabel: "Transparent",

        shapeTitle: "Shape & Settings",
        dotShapeLabel: "Dot shape",
        shapeSquare: "⬛ Square",
        shapeDots: "⚫ Dots",
        shapeRounded: "🔵 Rounded",
        shapeExtraRounded: "🟣 Extra rounded",
        shapeClassy: "💎 Classy",
        shapeClassyRounded: "✨ Classy rounded",
        roundedCornersLabel: "Rounded corners",
        errorLevelLabel: "Error correction level",
        errorLow: "Low (L) — 7%",
        errorMedium: "Medium (M) — 15%",
        errorHigh: "High (Q) — 25%",
        errorVeryHigh: "Very high (H) — 30%",
        sizeLabel: "Export size",
        marginLabel: "Margin",
        marginNone: "None",
        marginLarge: "Large",

        logoTitle: "Logo",
        logoDropText: "Click to upload logo",
        logoDropHint: "PNG with transparent background — best",
        logoRemove: "Remove logo",

        previewEmpty: "Enter content to preview the QR code",
        statError: "Error",
        statSize: "Size",
        statLogo: "Logo",
        statShape: "Shape",
        downloadTitle: "Download",
        dlPng: "Download PNG",
        dlPngHint: "transparent",
        dlSvg: "Download SVG",
        dlSvgHint: "vector",
        dlJpg: "Download JPG",
        dlJpgHint: "small",
        shareWhatsapp: "Share via WhatsApp",

        errNoContent: "Please enter a link or text first.",
        errIncompleteLink: "The link appears incomplete. Example: https://example.com",
        errNoFile: "Please select an Excel or CSV file first.",
        errNoContentColumn: "Please select the link/content column.",
        errEmptyFile: "The file does not contain data that can be generated.",
        warnLowContrast: "Warning: The contrast between the dots and background is low, so the QR code may be difficult to scan.",
        warnLargeLogo: "Warning: The logo is large and may affect QR readability. Use a high error correction level.",
        toastDownloaded: "QR code downloaded",

        listTitle: "Content list",
        listDescription: "Each item between separators = one QR code (links, text, numbers...)",
        delimiterLabel: "Separator between items",
        delimNewline: "New line",
        delimComma: "Comma ( , )",
        delimSemicolon: "Semicolon ( ; )",
        listPlaceholder: "https://example.com\nhttps://google.com\nSample text",
        generatePreview: "Generate preview",
        importExcelTitle: "Or import from Excel / CSV",
        excelDropText: "Click to upload file",
        excelContentColLabel: "Link / content column",
        excelNameColLabel: "Filename column (optional)",
        excelNameColNone: "— None (auto numbering) —",
        generateFromFile: "Generate from file",
        shapeColorsTitle: "Shape & Colors",
        formatLabel: "File format",
        previewCountTitle: "Preview",
        downloadZip: "Download all as ZIP",
        batchEmpty: "Paste a list or import an Excel file, then click generate",
        toastGenerated: (n) => `${n} QR codes generated successfully.`,
        toastZipDone: (n) => `${n} QR codes downloaded in a ZIP file`,
        generatingZip: (done, total) => `Downloading ${done}/${total}...`,
        generatingCodes: "Generating QR codes...",
        generationComplete: "Generation complete.",
        toastExcelLoaded: (n) => `${n} rows loaded — select columns then click generate`,
        toastNoValidRows: "No valid values found in the selected content column",
        toastEmptyFile2: "The file is empty or contains no data",
        toastFileReadError: (msg) => `Error reading file: ${msg}`,
        toastExportError: (msg) => `Export error: ${msg}`,

        aboutName: "Abdullah Altwijri",
        aboutRole: "Data Analyst · Business Intelligence · Python & Django Developer",
        aboutBio: "QR Gen is a free tool for creating QR codes quickly, whether you need a single code or hundreds in bulk from Excel/CSV. It runs directly in your browser and focuses on privacy and ease of use.",
        aboutGithub: "GitHub",
        aboutLinkedin: "LinkedIn",
        aboutEmail: "Email me",
        aboutBack: "Back to portfolio",
    },
};

class I18n {
    constructor() {
        const saved = localStorage.getItem("qrgen_lang");
        this.lang = saved || (navigator.language?.toLowerCase().startsWith("ar") ? "ar" : "en");
        this._listeners = [];
    }

    t(key, ...args) {
        const dict = translations[this.lang] ?? translations.ar;
        const val = dict[key] ?? translations.ar[key] ?? key;
        return typeof val === "function" ? val(...args) : val;
    }

    setLang(lang) {
        if (lang !== "ar" && lang !== "en") return;
        this.lang = lang;
        localStorage.setItem("qrgen_lang", lang);
        this._applyDom();
        this._listeners.forEach(fn => fn(lang));
    }

    onChange(fn) {
        this._listeners.push(fn);
    }

    applyDom() {
        this._applyDom();
    }

    _applyDom() {
        document.documentElement.lang = this.lang;
        document.documentElement.dir = this.lang === "ar" ? "rtl" : "ltr";
        document.title = this.t("pageTitle");
        document.querySelector('meta[name="description"]')?.setAttribute("content", this.t("metaDescription"));
    }
}

export const i18n = new I18n();
