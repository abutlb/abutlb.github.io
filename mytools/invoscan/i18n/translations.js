export const T = {
  ar: {
    // ── Toolbar ──────────────────────────────────────
    logoSub:        'قارئ الفواتير الذكي',
    newInvoice:     'فاتورة جديدة',
    settings:       'الإعدادات',
    back:           'رجوع',
    langToggle:     'EN',

    // ── Upload Panel ──────────────────────────────────
    dropTitle:      'ارفع فاتورتك هنا',
    dropSub:        'اسحب وأفلت الملف أو اضغط للاختيار',
    browsBtn:       'استعراض الملفات',
    formats:        'PDF · JPG · PNG · WEBP — حتى 20MB',
    queueTitle:     'قائمة الانتظار',
    processAll:     'معالجة الكل',
    invoicesWaiting:'فواتير في الانتظار',
    addMore:        'إضافة المزيد',

    // ── Guidelines sidebar ────────────────────────────
    guideTitle:     'إرشادات للحصول على أفضل نتيجة',
    guideDigital:   'PDF رقمي',
    guideDigitalSub:'النص قابل للنسخ — دقة مثالية',
    guideClear:     'صورة واضحة مضاءة',
    guideClearSub:  'بدون ظلال أو انعكاسات',
    guideLarge:     'نص مقروء وكبير',
    guideLargeSub:  'غير ضبابي أو مضغوط',
    guideTilted:    'صورة ملتوية قليلاً',
    guideTiltedSub: 'يُقلّل من الدقة',
    guideDark:      'معتمة أو ضبابية',
    guideDarkSub:   'قد يفشل الاستخراج تماماً',
    guideNote:      'يدعم العربية والإنجليزية. المعالجة تتم بالكامل في متصفحك — لا يُرفع أي ملف للإنترنت.',

    // ── Accuracy card ──────────────────────────────
    accTitle:       'مؤشر الدقة المتوقعة',
    accDigital:     'PDF رقمي',
    accClear:       'صورة واضحة',
    accWeak:        'صورة ضعيفة',

    // ── Results Panel ──────────────────────────────────
    notDetected:    'لم يُكتشف',
    addRow:         'إضافة بند',
    rawText:        'النص الخام المستخرج',
    noRaw:          '(لا يوجد نص خام)',
    exportBtn:      'تصدير',
    previewDoc:     'معاينة المستند',
    invoiceData:    'بيانات الفاتورة',
    clickToEdit:    'انقر على أي حقل للتعديل',
    copyRaw:        'نسخ',
    copiedRaw:      '✓ تم النسخ',

    // ── Processing ──────────────────────────────────
    processing:     'جاري المعالجة...',
    preparing:      'جاري التحضير...',
    cancelProc:     'إلغاء',

    // ── Field Labels ──────────────────────────────────
    invoiceNumber:  'رقم الفاتورة',
    date:           'تاريخ الفاتورة',
    dueDate:        'تاريخ الاستحقاق',
    supplier:       'المورد / الشركة',
    customer:       'العميل / المشتري',
    vatNumber:      'الرقم الضريبي',
    poNumber:       'رقم أمر الشراء',
    currency:       'العملة',
    paymentTerms:   'شروط الدفع',
    notes:          'ملاحظات',

    // ── Items Table ──────────────────────────────────
    itemsTitle:     'بنود الفاتورة',
    colDesc:        'الوصف / البند',
    colQty:         'الكمية',
    colUnit:        'سعر الوحدة',
    colDiscount:    'الخصم',
    colVatPct:      'ضريبة %',
    colVatAmt:      'قيمة الضريبة',
    colTotal:       'الإجمالي',
    colActions:     '',
    deleteRow:      'حذف',

    // ── Totals ──────────────────────────────────────
    subtotal:       'المجموع الفرعي',
    discount:       'الخصم',
    tax:            'الضريبة (VAT)',
    total:          'الإجمالي الكلي',

    // ── Export Buttons ──────────────────────────────
    exportExcel:    'Excel',
    exportCsv:      'CSV',
    exportTemplate: 'قالب',
    exportAll:      'Excel الكل',
    exportAllCsv:   'CSV الكل',
    exportPrint:    'طباعة',

    // ── Processing messages ────────────────────────
    procLoading:     'جاري تحميل الملف...',
    procConvertPdf:  'تحويل صفحات PDF...',
    procLoadImg:     'تحميل الصورة...',
    procExtractTxt:  'استخراج النص المنظم...',
    procEnhance:     'تحسين جودة الصورة...',
    procInitOcr:     'تهيئة محرك OCR...',
    procOcr:         'جاري التعرف على النص...',
    procAiExtract:   'استخراج ذكي بـ AI...',
    procExtract:     'استخراج البيانات...',
    procDone:        'اكتمل!',
    procPage:        'صفحة',

    // ── Processing stages ──────────────────────────
    stageLoad:       'تحميل الملف',
    stageRender:     'تحويل الصفحات',
    stagePreprocess: 'تحسين الصورة',
    stageOcr:        'التعرف على النص (OCR)',
    stageExtract:    'استخراج البيانات',

    // ── Template editor ────────────────────────────
    tmplEditor:     'محرر القالب',
    tmplClearAll:   'مسح الكل',
    tmplHint:       'اسحب على الفاتورة لتحديد منطقة، ثم اختر نوعها',
    tmplName:       'اسم القالب',
    tmplNamePh:     'مثال: فاتورة شركة الدواء',
    tmplAnchor:     'نص التعرف التلقائي',
    tmplAnchorPh:   'نص مميز يظهر في هذا النوع من الفواتير',
    tmplAnchorHint: 'يُستخدم للكشف التلقائي عند رفع فاتورة جديدة من نفس المورد',
    tmplRegions:    'المناطق المحددة',
    tmplDrawHint:   'ارسم مربعاً على الفاتورة لتحديد منطقة',
    tmplSave:       'حفظ القالب',
    tmplExportJson: 'تصدير JSON',
    tmplLibrary:    'مكتبة القوالب',
    tmplImport:     'استيراد قالب',
    tmplApplied:    'تم تطبيق قالب:',

    // ── Field picker ───────────────────────────────
    fpTitle:        'نوع المنطقة',
    fpSupplier:     'المورد',
    fpCustomer:     'العميل',
    fpAmounts:      'المبالغ',
    fpTax:          'الضريبة',
    fpTable:        'جدول البنود ★',

    // ── Column step modal ──────────────────────────
    colStepTitle:   'تحديد أعمدة الجدول',
    colStepDesc:    'اكتُشفت الأعمدة التالية من صف الرأس — حدد ما يمثله كل عمود أو اختر "تجاهل"',
    colConfirm:     'تأكيد',

    // ── Settings modal ─────────────────────────────
    aiMode:         'وضع الذكاء الاصطناعي',
    aiHint:         'اختر مزوداً وأدخل مفتاحه لرفع دقة الاستخراج إلى ~95%. المفتاح يُحفظ في متصفحك فقط ولا يمرّ بأي خادم وسيط.',
    aiModel:        'النموذج',
    aiKey:          'مفتاح API',
    aiTest:         'اختبار',
    aiSave:         'حفظ وتفعيل',
    aiClear:        'مسح',
    aiGetKey:       'احصل على مفتاح مجاناً ←',
    aiFree:         'مجاني',
    aiEnterKey:     'أدخل المفتاح أولاً',
    aiSaved:        'تم الحفظ ✓',
    aiCleared:      'تم مسح المفتاح',
    aiTesting:      'جاري الاختبار...',
    aiWorking:      'يعمل بنجاح',
    aiFailed:       'فشل',

    // ── Quality Badge ──────────────────────────────
    ocrConf:        'ثقة OCR',
  },

  en: {
    // ── Toolbar ──────────────────────────────────────
    logoSub:        'Smart Invoice Reader',
    newInvoice:     'New Invoice',
    settings:       'Settings',
    back:           'Back',
    langToggle:     'عربي',

    // ── Upload Panel ──────────────────────────────────
    dropTitle:      'Drop your invoice here',
    dropSub:        'Drag & drop or click to browse',
    browsBtn:       'Browse Files',
    formats:        'PDF · JPG · PNG · WEBP — up to 20MB',
    queueTitle:     'Queue',
    processAll:     'Process All',
    invoicesWaiting:'invoices waiting',
    addMore:        'Add More',

    // ── Guidelines sidebar ────────────────────────────
    guideTitle:     'Tips for Best Results',
    guideDigital:   'Digital PDF',
    guideDigitalSub:'Selectable text — ideal accuracy',
    guideClear:     'Clear, well-lit image',
    guideClearSub:  'No shadows or glare',
    guideLarge:     'Large, readable text',
    guideLargeSub:  'Not blurry or compressed',
    guideTilted:    'Slightly tilted image',
    guideTiltedSub: 'Reduces accuracy',
    guideDark:      'Dark or blurry',
    guideDarkSub:   'Extraction may completely fail',
    guideNote:      'Supports Arabic & English. Processed entirely in your browser — no file is uploaded.',

    // ── Accuracy card ──────────────────────────────
    accTitle:       'Expected Accuracy',
    accDigital:     'Digital PDF',
    accClear:       'Clear image',
    accWeak:        'Poor image',

    // ── Results Panel ──────────────────────────────────
    notDetected:    'Not detected',
    addRow:         'Add Row',
    rawText:        'Extracted Raw Text',
    noRaw:          '(No raw text)',
    exportBtn:      'Export',
    previewDoc:     'Document Preview',
    invoiceData:    'Invoice Data',
    clickToEdit:    'Click any field to edit',
    copyRaw:        'Copy',
    copiedRaw:      '✓ Copied',

    // ── Processing ──────────────────────────────────
    processing:     'Processing...',
    preparing:      'Preparing...',
    cancelProc:     'Cancel',

    // ── Field Labels ──────────────────────────────────
    invoiceNumber:  'Invoice No.',
    date:           'Invoice Date',
    dueDate:        'Due Date',
    supplier:       'Supplier / Company',
    customer:       'Customer / Buyer',
    vatNumber:      'VAT / Tax No.',
    poNumber:       'PO Number',
    currency:       'Currency',
    paymentTerms:   'Payment Terms',
    notes:          'Notes',

    // ── Items Table ──────────────────────────────────
    itemsTitle:     'Line Items',
    colDesc:        'Description / Item',
    colQty:         'Qty',
    colUnit:        'Unit Price',
    colDiscount:    'Discount',
    colVatPct:      'VAT %',
    colVatAmt:      'VAT Amount',
    colTotal:       'Total',
    colActions:     '',
    deleteRow:      'Delete',

    // ── Totals ──────────────────────────────────────
    subtotal:       'Subtotal',
    discount:       'Discount',
    tax:            'Tax / VAT',
    total:          'Grand Total',

    // ── Export Buttons ──────────────────────────────
    exportExcel:    'Excel',
    exportCsv:      'CSV',
    exportTemplate: 'Template',
    exportAll:      'Excel All',
    exportAllCsv:   'CSV All',
    exportPrint:    'Print',

    // ── Processing messages ────────────────────────
    procLoading:     'Loading file...',
    procConvertPdf:  'Converting PDF pages...',
    procLoadImg:     'Loading image...',
    procExtractTxt:  'Extracting structured text...',
    procEnhance:     'Enhancing image quality...',
    procInitOcr:     'Initializing OCR engine...',
    procOcr:         'Recognizing text...',
    procAiExtract:   'Smart extraction with AI...',
    procExtract:     'Extracting data...',
    procDone:        'Done!',
    procPage:        'Page',

    // ── Processing stages ──────────────────────────
    stageLoad:       'Loading file',
    stageRender:     'Converting pages',
    stagePreprocess: 'Enhancing image',
    stageOcr:        'Text recognition (OCR)',
    stageExtract:    'Extracting data',

    // ── Template editor ────────────────────────────
    tmplEditor:     'Template Editor',
    tmplClearAll:   'Clear All',
    tmplHint:       'Draw on the invoice to select a region, then choose its type',
    tmplName:       'Template Name',
    tmplNamePh:     'e.g. Pharma Company Invoice',
    tmplAnchor:     'Auto-detect Text',
    tmplAnchorPh:   'Unique text that appears in this invoice type',
    tmplAnchorHint: 'Used for automatic detection when uploading a new invoice from the same supplier',
    tmplRegions:    'Selected Regions',
    tmplDrawHint:   'Draw a box on the invoice to define a region',
    tmplSave:       'Save Template',
    tmplExportJson: 'Export JSON',
    tmplLibrary:    'Template Library',
    tmplImport:     'Import Template',
    tmplApplied:    'Template applied:',

    // ── Field picker ───────────────────────────────
    fpTitle:        'Region Type',
    fpSupplier:     'Supplier',
    fpCustomer:     'Customer',
    fpAmounts:      'Amounts',
    fpTax:          'Tax',
    fpTable:        'Line Items Table ★',

    // ── Column step modal ──────────────────────────
    colStepTitle:   'Map Table Columns',
    colStepDesc:    'The following columns were detected from the header row — assign each column or choose "Ignore"',
    colConfirm:     'Confirm',

    // ── Settings modal ─────────────────────────────
    aiMode:         'AI Mode',
    aiHint:         'Choose a provider and enter its key to boost extraction accuracy to ~95%. The key is stored only in your browser and never passes through any server.',
    aiModel:        'Model',
    aiKey:          'API Key',
    aiTest:         'Test',
    aiSave:         'Save & Enable',
    aiClear:        'Clear',
    aiGetKey:       'Get a free API key →',
    aiFree:         'Free',
    aiEnterKey:     'Enter the key first',
    aiSaved:        'Saved ✓',
    aiCleared:      'Key cleared',
    aiTesting:      'Testing...',
    aiWorking:      'is working',
    aiFailed:       'Failed',

    // ── Quality Badge ──────────────────────────────
    ocrConf:        'OCR Confidence',
  },
};
