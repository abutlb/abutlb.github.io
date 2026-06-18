// features/Templates.js — قوالب المخططات الجاهزة

export const TEMPLATES = {

    store: {
        name: 'متجر إلكتروني',
        level: '0',
        nodes: [
            { id:'e1', type:'entity',    label:'العميل',        x:120,  y:220,  w:140, h:60,  number:'',  description:'المستخدم النهائي للمتجر' },
            { id:'e2', type:'entity',    label:'بوابة الدفع',   x:120,  y:480,  w:140, h:60,  number:'',  description:'جهة خارجية لمعالجة المدفوعات' },
            { id:'p1', type:'process',   label:'إدارة الطلبات', x:360,  y:220,  w:100, h:100, number:'1', description:'استقبال ومعالجة طلبات الشراء' },
            { id:'p2', type:'process',   label:'معالجة الدفع',  x:360,  y:480,  w:100, h:100, number:'2', description:'إتمام عملية الدفع والتحقق' },
            { id:'p3', type:'process',   label:'إدارة المخزون', x:590,  y:350,  w:100, h:100, number:'3', description:'تتبع وتحديث مخزون المنتجات' },
            { id:'d1', type:'datastore', label:'الطلبات',       x:560,  y:160,  w:170, h:52,  number:'D1', description:'جدول الطلبات والحالات' },
            { id:'d2', type:'datastore', label:'المنتجات',      x:560,  y:460,  w:170, h:52,  number:'D2', description:'كتالوج المنتجات والأسعار' },
            { id:'d3', type:'datastore', label:'العملاء',       x:230,  y:360,  w:170, h:52,  number:'D3', description:'بيانات العملاء المسجلين' },
        ],
        edges: [
            { id:'f1', from:'e1', to:'p1', label:'بيانات الطلب',      description:'اسم المنتج، الكمية، العنوان' },
            { id:'f2', from:'p1', to:'e1', label:'تأكيد الطلب',       description:'رقم الطلب وحالته' },
            { id:'f3', from:'p1', to:'d1', label:'حفظ الطلب',         description:'تخزين تفاصيل الطلب' },
            { id:'f4', from:'p1', to:'p2', label:'طلب الدفع',         description:'المبلغ وبيانات الدفع' },
            { id:'f5', from:'p2', to:'e2', label:'بيانات المعاملة',   description:'تفاصيل بطاقة الدفع' },
            { id:'f6', from:'e2', to:'p2', label:'نتيجة التفويض',     description:'نجاح أو فشل الدفع' },
            { id:'f7', from:'p2', to:'p1', label:'حالة الدفع',        description:'تأكيد الدفع لإكمال الطلب' },
            { id:'f8', from:'p3', to:'d2', label:'تحديث المخزون',     description:'خصم الكميات المطلوبة' },
            { id:'f9', from:'p1', to:'d3', label:'بيانات العميل',     description:'تحديث سجل المشتريات' },
        ],
    },

    library: {
        name: 'إدارة مكتبة',
        level: '0',
        nodes: [
            { id:'e1', type:'entity',    label:'العضو',          x:100,  y:200,  w:140, h:60,  number:'',  description:'المستفيد من المكتبة' },
            { id:'e2', type:'entity',    label:'أمين المكتبة',   x:100,  y:460,  w:140, h:60,  number:'',  description:'موظف المكتبة المسؤول' },
            { id:'p1', type:'process',   label:'إدارة الإعارة',  x:340,  y:200,  w:100, h:100, number:'1', description:'معالجة عمليات استعارة وإعادة الكتب' },
            { id:'p2', type:'process',   label:'إدارة الفهرس',   x:340,  y:460,  w:100, h:100, number:'2', description:'إضافة وتحديث بيانات الكتب' },
            { id:'p3', type:'process',   label:'إصدار التقارير', x:580,  y:330,  w:100, h:100, number:'3', description:'توليد تقارير الإعارة والمخزون' },
            { id:'d1', type:'datastore', label:'الكتب',          x:490,  y:140,  w:170, h:52,  number:'D1', description:'فهرس الكتب والنسخ المتاحة' },
            { id:'d2', type:'datastore', label:'الأعضاء',        x:230,  y:350,  w:170, h:52,  number:'D2', description:'بيانات أعضاء المكتبة' },
            { id:'d3', type:'datastore', label:'سجل الإعارات',   x:490,  y:490,  w:170, h:52,  number:'D3', description:'تاريخ الاستعارات والإعادات' },
        ],
        edges: [
            { id:'f1', from:'e1', to:'p1', label:'طلب استعارة',       description:'رقم الكتاب وهوية العضو' },
            { id:'f2', from:'p1', to:'e1', label:'تأكيد الإعارة',     description:'تاريخ الاستحقاق' },
            { id:'f3', from:'p1', to:'d3', label:'تسجيل الإعارة',     description:'حفظ عملية الاستعارة' },
            { id:'f4', from:'p1', to:'d1', label:'تحديث توفر الكتاب', description:'تقليل عدد النسخ المتاحة' },
            { id:'f5', from:'e2', to:'p2', label:'بيانات كتاب جديد',  description:'معلومات الكتاب الكاملة' },
            { id:'f6', from:'p2', to:'d1', label:'إضافة/تعديل كتاب',  description:'حفظ البيانات الببليوغرافية' },
            { id:'f7', from:'p3', to:'e2', label:'التقارير الإدارية', description:'ملخص نشاط المكتبة' },
            { id:'f8', from:'d3', to:'p3', label:'بيانات الإعارات',   description:'سجلات الاستعارة للتحليل' },
        ],
    },

    hospital: {
        name: 'نظام مستشفى',
        level: '0',
        nodes: [
            { id:'e1', type:'entity',    label:'المريض',         x:100,  y:180,  w:140, h:60,  number:'',  description:'مريض مسجل في المستشفى' },
            { id:'e2', type:'entity',    label:'الطبيب',         x:100,  y:460,  w:140, h:60,  number:'',  description:'الكادر الطبي' },
            { id:'p1', type:'process',   label:'إدارة المواعيد', x:340,  y:180,  w:100, h:100, number:'1', description:'حجز وجدولة المواعيد الطبية' },
            { id:'p2', type:'process',   label:'السجل الطبي',    x:340,  y:460,  w:100, h:100, number:'2', description:'إدارة ملفات المرضى الطبية' },
            { id:'p3', type:'process',   label:'الوصفات الطبية', x:580,  y:320,  w:100, h:100, number:'3', description:'كتابة وإدارة الوصفات الطبية' },
            { id:'d1', type:'datastore', label:'المواعيد',       x:490,  y:120,  w:170, h:52,  number:'D1', description:'جدول المواعيد والتواريخ' },
            { id:'d2', type:'datastore', label:'السجلات الطبية', x:490,  y:360,  w:170, h:52,  number:'D2', description:'تاريخ المرضى والتشخيصات' },
            { id:'d3', type:'datastore', label:'الأدوية',        x:490,  y:480,  w:170, h:52,  number:'D3', description:'قاعدة بيانات الأدوية والجرعات' },
        ],
        edges: [
            { id:'f1', from:'e1', to:'p1', label:'طلب موعد',          description:'التاريخ المطلوب والتخصص' },
            { id:'f2', from:'p1', to:'e1', label:'تأكيد الموعد',      description:'التاريخ والوقت والطبيب' },
            { id:'f3', from:'p1', to:'d1', label:'حفظ الموعد',        description:'تسجيل الموعد في الجدول' },
            { id:'f4', from:'e2', to:'p2', label:'ملاحظات الطبيب',    description:'التشخيص والنتائج' },
            { id:'f5', from:'p2', to:'d2', label:'تحديث السجل',       description:'إضافة الزيارة للسجل الطبي' },
            { id:'f6', from:'e2', to:'p3', label:'بيانات الوصفة',     description:'الأدوية والجرعات والمدة' },
            { id:'f7', from:'p3', to:'d3', label:'التحقق من الدواء',  description:'فحص التفاعلات الدوائية' },
            { id:'f8', from:'p3', to:'e1', label:'الوصفة الطبية',     description:'نسخة المريض من الوصفة' },
        ],
    },
};
