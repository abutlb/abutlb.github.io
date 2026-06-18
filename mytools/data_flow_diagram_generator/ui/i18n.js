// ui/i18n.js — ترجمات عربي / إنجليزي

export const TRANSLATIONS = {

    ar: {
        dir: 'rtl',
        logo:    { name: 'مولد DFD', sub: 'مخططات تدفق البيانات' },
        toolbar: {
            back: 'رجوع',
            select: 'تحديد', connect: 'ربط',
            undo: 'تراجع', redo: 'إعادة', delete: 'حذف',
            fitView: 'ضبط', grid: 'شبكة', snap: 'تثبيت',
            layout: 'ترتيب', validate: 'تحقق',
            save: 'حفظ', export: 'تصدير',
            exportSVG: 'SVG', exportPNG: 'PNG', exportPDF: 'PDF', print: 'طباعة A4',
            share: 'مشاركة',
        },
        panel: {
            project: 'المشروع', addElements: 'إضافة عناصر',
            addHint: 'اضغط للإضافة في المنتصف، أو اسحب للمكان المطلوب',
            templates: 'قوالب جاهزة', stats: 'إحصائيات',
            shortcuts: 'اختصارات لوحة المفاتيح',
        },
        nodes: {
            entity: 'كيان خارجي', entitySub: 'External Entity',
            process: 'عملية', processSub: 'Process',
            datastore: 'مخزن بيانات', datastoreSub: 'Data Store',
            annotation: 'ملاحظة', annotationSub: 'Annotation',
        },
        templates: {
            store: 'متجر إلكتروني', library: 'إدارة مكتبة', hospital: 'نظام مستشفى',
        },
        stats: {
            entities: 'كيانات', processes: 'عمليات', stores: 'مخازن', flows: 'تدفقات',
        },
        project: {
            namePh: 'اسم المشروع', authorPh: 'المؤلف',
            lvlContext: 'مخطط السياق', lvl0: 'المستوى 0', lvl1: 'المستوى 1', lvl2: 'المستوى 2',
        },
        edge: {
            title: 'تدفق بيانات جديد', sub: 'أدخل وصف البيانات المنقولة بين العنصرين',
            labelPh: 'مثال: بيانات الطلب', descPh: 'مثال: رقم الطلب، اسم المنتج...',
            confirm: 'إضافة التدفق', cancel: 'إلغاء',
            labelLbl: 'اسم التدفق', descLbl: 'وصف تفصيلي (قاموس البيانات) — اختياري',
        },
        val: {
            title: 'التحقق من المخطط', close: 'إغلاق',
            ok: 'المخطط صحيح! لا توجد أخطاء.',
            errors: 'أخطاء', warnings: 'تحذيرات',
        },
        props: {
            label: 'التسمية', number: 'رقم العملية', storeId: 'معرف المخزن',
            description: 'الوصف (قاموس البيانات)',
            flowLabel: 'اسم التدفق', flowDesc: 'وصف البيانات (قاموس)',
            deleteNode: 'حذف', deleteEdge: 'حذف التدفق',
            types: { entity: 'كيان خارجي', process: 'عملية', datastore: 'مخزن بيانات', annotation: 'ملاحظة', edge: 'تدفق بيانات' },
        },
        toast: {
            welcome: 'مرحباً! اسحب العناصر أو اضغط عليها للإضافة',
            saved: 'تم حفظ المشروع', loaded: 'تم تحميل المشروع',
            svgExported: 'تم تصدير SVG', pngExported: 'تم تصدير PNG', pdfExported: 'تم تصدير PDF',
            urlCopied: 'تم نسخ الرابط إلى الحافظة', urlManual: 'انسخ الرابط يدوياً:',
            restored: 'تم استعادة المخطط من الرابط',
            gridOn: 'الشبكة: مفعّلة', gridOff: 'الشبكة: مخفية',
            snapOn: 'التثبيت: مفعّل', snapOff: 'التثبيت: معطّل',
            layoutDone: 'تم الترتيب التلقائي',
            noContent: 'لا توجد عناصر للتصدير', noPreview: 'لا توجد عناصر للعرض',
            noPrint: 'لا توجد عناصر للطباعة', pdfNotLoaded: 'مكتبة PDF لم تُحمَّل بعد',
            tplLoaded: 'تم تحميل القالب: ', tplConfirm: 'سيتم استبدال المخطط الحالي. هل تريد المتابعة؟',
            langChanged: 'تم التحويل إلى العربية',
        },
        shortcuts: [
            '[[V]] تحديد   [[C]] ربط   [[H]] تحريك',
            '[[Del]] حذف   [[Esc]] إلغاء',
            '[[Ctrl+Z]] تراجع   [[Ctrl+Y]] إعادة',
            '[[Ctrl+A]] تحديد الكل   [[Ctrl+0]] ضبط',
            '[[دبل كليك]] تعديل / إضافة عملية',
        ],
        validation: {
            noElements: 'المخطط فارغ — لا توجد عناصر بعد',
            noInput:     n => `العملية "${n.label}" (${n.number}) لا يوجد لها مدخل`,
            noOutput:    n => `العملية "${n.label}" (${n.number}) لا يوجد لها مخرج`,
            unlinkedEntity: n => `الكيان "${n.label}" غير مرتبط بأي تدفق`,
            unlinkedStore:  n => `مخزن "${n.label}" غير مرتبط بأي تدفق`,
            noLabel:     n => `عنصر بدون تسمية (${n.type})`,
            entityStore: (f,t) => `ربط مباشر بين كيان "${f.label}" ومخزن "${t.label}" — يجب المرور عبر عملية`,
            storeStore:  (f,t) => `ربط مباشر بين مخزنين "${f.label}" و"${t.label}" — غير مسموح`,
            noFlowLabel: (f,t) => `تدفق بدون تسمية بين "${f.label}" و"${t.label}"`,
            duplicate:   () => `تدفق مكرر بين نفس العنصرين`,
        },
    },

    en: {
        dir: 'ltr',
        logo:    { name: 'DFD Builder', sub: 'Data Flow Diagrams' },
        toolbar: {
            back: 'Back',
            select: 'Select', connect: 'Connect',
            undo: 'Undo', redo: 'Redo', delete: 'Delete',
            fitView: 'Fit', grid: 'Grid', snap: 'Snap',
            layout: 'Layout', validate: 'Validate',
            save: 'Save', export: 'Export',
            exportSVG: 'SVG', exportPNG: 'PNG', exportPDF: 'PDF', print: 'Print A4',
            share: 'Share',
        },
        panel: {
            project: 'Project', addElements: 'Add Elements',
            addHint: 'Click to add at center, or drag to position',
            templates: 'Templates', stats: 'Statistics',
            shortcuts: 'Keyboard Shortcuts',
        },
        nodes: {
            entity: 'External Entity', entitySub: 'Rectangle',
            process: 'Process', processSub: 'Circle',
            datastore: 'Data Store', datastoreSub: 'Open Rectangle',
            annotation: 'Note', annotationSub: 'Annotation',
        },
        templates: {
            store: 'E-Commerce Store', library: 'Library System', hospital: 'Hospital System',
        },
        stats: {
            entities: 'Entities', processes: 'Processes', stores: 'Stores', flows: 'Flows',
        },
        project: {
            namePh: 'Project name', authorPh: 'Author',
            lvlContext: 'Context Diagram', lvl0: 'Level 0', lvl1: 'Level 1', lvl2: 'Level 2',
        },
        edge: {
            title: 'New Data Flow', sub: 'Enter the description of data transferred between elements',
            labelPh: 'e.g., Order Data', descPh: 'e.g., Order ID, product name...',
            confirm: 'Add Flow', cancel: 'Cancel',
            labelLbl: 'Flow Name', descLbl: 'Detailed description (Data Dictionary) — optional',
        },
        val: {
            title: 'Diagram Validation', close: 'Close',
            ok: 'Diagram is valid! No issues found.',
            errors: 'Errors', warnings: 'Warnings',
        },
        props: {
            label: 'Label', number: 'Process Number', storeId: 'Store ID',
            description: 'Description (Data Dictionary)',
            flowLabel: 'Flow Name', flowDesc: 'Data Description (Dictionary)',
            deleteNode: 'Delete', deleteEdge: 'Delete Flow',
            types: { entity: 'External Entity', process: 'Process', datastore: 'Data Store', annotation: 'Note', edge: 'Data Flow' },
        },
        toast: {
            welcome: 'Welcome! Drag or click elements to add them',
            saved: 'Project saved', loaded: 'Project loaded',
            svgExported: 'SVG exported', pngExported: 'PNG exported', pdfExported: 'PDF exported',
            urlCopied: 'Link copied to clipboard', urlManual: 'Copy link manually:',
            restored: 'Diagram restored from URL',
            gridOn: 'Grid: On', gridOff: 'Grid: Off',
            snapOn: 'Snap: On', snapOff: 'Snap: Off',
            layoutDone: 'Auto-layout applied',
            noContent: 'No elements to export', noPreview: 'No elements to display',
            noPrint: 'No elements to print', pdfNotLoaded: 'PDF library not loaded yet',
            tplLoaded: 'Template loaded: ', tplConfirm: 'This will replace the current diagram. Continue?',
            langChanged: 'Switched to English',
        },
        shortcuts: [
            '[[V]] Select   [[C]] Connect   [[H]] Pan',
            '[[Del]] Delete   [[Esc]] Cancel',
            '[[Ctrl+Z]] Undo   [[Ctrl+Y]] Redo',
            '[[Ctrl+A]] Select All   [[Ctrl+0]] Fit View',
            '[[Dbl-click]] Edit / Add Process',
        ],
        validation: {
            noElements: 'Diagram is empty — no elements yet',
            noInput:     n => `Process "${n.label}" (${n.number}) has no input`,
            noOutput:    n => `Process "${n.label}" (${n.number}) has no output`,
            unlinkedEntity: n => `Entity "${n.label}" has no connected flows`,
            unlinkedStore:  n => `Data store "${n.label}" has no connected flows`,
            noLabel:     n => `Unlabeled element (${n.type})`,
            entityStore: (f,t) => `Direct entity-store link: "${f.label}" → "${t.label}" — must pass through a process`,
            storeStore:  (f,t) => `Direct store-store link: "${f.label}" → "${t.label}" — not allowed in DFD`,
            noFlowLabel: (f,t) => `Unlabeled flow between "${f.label}" and "${t.label}"`,
            duplicate:   () => `Duplicate flow between same elements`,
        },
    },
};

export function getLang() {
    return localStorage.getItem('dfd-lang') || 'ar';
}

export function T() {
    return TRANSLATIONS[getLang()] || TRANSLATIONS.ar;
}
