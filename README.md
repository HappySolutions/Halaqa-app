# مُقرِئ — مُتابع الحلقات

نظام ويب عربي (RTL) لإدارة تقارير **حلقات تحفيظ القرآن** اليومية. يتيح للطلاب تسجيل المراجعة أو الغياب، وللمشرفين متابعة الحلقة وإنشاء تقرير جاهز للنسخ إلى واتساب.

---

## نظرة عامة

| البند | التفاصيل |
|--------|-----------|
| **النوع** | تطبيق ويب أحادي الصفحة (SPA) |
| **اللغة** | TypeScript |
| **الواجهة** | React 19 |
| **أداة البناء** | Vite 6 |
| **قاعدة البيانات** | Firebase Firestore (مزامنة فورية + تخزين محلي) |
| **المنطقة الزمنية** | `Asia/Riyadh` (توقيت السعودية) |
| **النشر** | موقع ثابت على Netlify أو Vercel |

---

## الميزات الرئيسية

### واجهة الطالب (`StudentForm`)

- اختيار الحلقة ثم الطالب من قائمة قابلة للبحث (لتقليل أخطاء الأسماء)
- تسجيل المراجعة اليومية:
  - عدد الصفحات (يدعم 0.5)
  - السور المراجَعة
  - تأكيد إتمام المراجعة
  - أو تسجيل الغياب مع السبب
- منع التسجيل المكرر لنفس الطالب في نفس اليوم الفعلي (مع إمكانية التعديل)
- قفل التسجيل بين `registrationLockTime` (افتراضي 19:00) و`nextDayRegStartTime` (افتراضي 22:30)
- عرض قائمة تسجيلات اليوم للحلقة مرتبة حسب الدور
- تعديل التسجيل الذاتي

### واجهة المشرف (`AdminPanel` + `StudentManager`)

- دخول بكلمة مرور:
  - **كلمة المشرف العام** → صلاحيات كاملة
  - **كلمة مرور المعلّم** → صلاحيات حلقة واحدة فقط
- لوحة إحصائيات: عدد الطلاب، نسبة الإنجاز، إجمالي الصفحات
- إدارة التقارير: تعديل، حذف مؤقت، استعادة من السلة، تأجيل لليوم التالي، إعادة ترتيب الدور
- **تقرير واتساب**: نص عربي منسّق (تاريخ هجري + ميلادي، حضور/غياب، الصفحات) مع نسخ للحافظة
- إدارة الحلقات (للمشرف العام): الاسم، أوقات القفل، كلمة مرور المعلّم
- إدارة الطلاب: إضافة فردية أو جماعية (لصق الأسماء سطراً بسطر)، إعادة تسمية، ترتيب القائمة

### منطق العمل

- **اليوم الفعلي**: بعد `nextDayRegStartTime` يُحسب التسجيل لليوم العمل التالي
- **أيام العمل**: تخطي الجمعة والسبت (عطلة نهاية الأسبوع السعودية)
- **ترتيب الدور**: الحاضرون أولاً ثم الغائبون
- **الحذف الناعم**: `isDeleted: true` مع إمكانية الاستعادة
- **تنظيف تلقائي**: حذف تقارير أقدم من 7 أيام (لتوفير حصة Firestore)
- **تحسين القراءة**: الاشتراك في تقارير آخر يومين فقط

---

## هيكل المشروع

```
HalaqaApp/
├── index.html                 # نقطة الدخول (عربي RTL + خطوط Google)
├── package.json               # التبعيات وسكربتات npm
├── tsconfig.json              # إعدادات TypeScript (@/ → src/)
├── vite.config.ts             # Vite + React + Tailwind
├── .env.example               # قالب متغيرات البيئة
├── netlify.toml               # إعدادات نشر Netlify
├── vercel.json                # إعدادات نشر Vercel
├── metadata.json              # بيانات التطبيق (اسم ووصف عربي)
└── src/
    ├── main.tsx               # تشغيل React
    ├── App.tsx                # الحالة المركزية + Firebase CRUD + التنقل
    ├── types.ts               # واجهات Halaqa, Student, Report
    ├── index.css              # Tailwind 4 + ثيم RTL
    ├── lib/
    │   ├── firebase.ts        # تهيئة Firestore مع كاش محلي
    │   └── utils.ts           # التواريخ، أيام العمل، cn()
    └── components/
        ├── Header.tsx         # التنقل: طالب / مشرف
        ├── StudentForm.tsx    # نموذج تسجيل الطالب
        ├── AdminPanel.tsx     # لوحة المشرف + تقرير واتساب
        └── StudentManager.tsx # إدارة الحلقات والطلاب
```

---

## نموذج البيانات (Firestore)

| المجموعة | الحقول الرئيسية |
|----------|-----------------|
| `halaqat` | `name`, `teacherName`, `registrationLockTime`, `nextDayRegStartTime`, `password` |
| `students` | `name`, `halaqaId`, `order` |
| `reports` | `studentId`, `studentName`, `halaqaId`, `pagesReviewed`, `surahs`, `hasReviewed`, `isAbsent`, `absenceReason`, `date`, `turnOrder`, `isDeleted`, `isDeferred` |

---

## التقنيات المستخدمة

| التقنية | الاستخدام |
|---------|-----------|
| React 19 | واجهة المستخدم |
| Vite 6 | التطوير والبناء |
| Tailwind CSS 4 | التنسيق |
| Firebase 12 | Firestore (مزامنة فورية) |
| Motion | الحركات والانتقالات |
| date-fns | التواريخ والتقويم الهجري |
| lucide-react | الأيقونات |

> **ملاحظة:** بعض التبعيات في `package.json` (`@google/genai`, `express`) من قالب AI Studio وغير مستخدمة في الكود الحالي.

---

## التشغيل المحلي

### المتطلبات

- Node.js
- مشروع Firebase مع تفعيل Firestore

### الخطوات

```bash
# 1. تثبيت التبعيات
npm install

# 2. إنشاء ملف البيئة
cp .env.example .env.local
```

أضف إعدادات Firebase في `.env.local`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

```bash
# 3. تشغيل التطبيق
npm run dev
# يعمل على http://localhost:3000
```

### أوامر أخرى

```bash
npm run build    # بناء للإنتاج → dist/
npm run preview  # معاينة البناء محلياً
npm run lint     # فحص TypeScript
```

> بدون `VITE_FIREBASE_PROJECT_ID` يعمل التطبيق لكن بدون اتصال بقاعدة البيانات.

---

## النشر

الملفات `netlify.toml` و`vercel.json` مهيأة لنشر SPA مع إعادة توجيه جميع المسارات إلى `index.html`.

**Netlify:** أمر البناء `npm run build`، مجلد النشر `dist`  
**Vercel:** نفس البناء مع إعادة كتابة المسارات

---

## الأمان والمصادقة

- **لا يوجد خادم خلفي** — الاتصال مباشر من المتصفح إلى Firestore
- **المصادقة:** كلمة مرور مخصصة (ليست Firebase Auth)
  - المشرف العام: كلمة مرور ثابتة في الكود
  - معلّم الحلقة: كلمة مرور مخزنة في مستند الحلقة
- **الجلسة:** `localStorage` (`halaqa_admin_role`, `halaqa_admin_id`)
- **واتساب:** نسخ نص فقط — لا يوجد تكامل مع WhatsApp API

> **تنبيه للإنتاج:** يُنصح بتكوين قواعد أمان Firestore بعناية؛ كلمات المرور ظاهرة في جانب العميل.

---

## البنية المعمارية

```
┌─────────────────────────────────────────────────┐
│                    App.tsx                       │
│  (الحالة + Firebase CRUD + منطق الأعمال)        │
└────────────┬────────────────────────────────────┘
             │ props / callbacks
   ┌─────────┼─────────┬──────────────┐
   ▼         ▼         ▼              ▼
Header  StudentForm  AdminPanel  StudentManager
             │                         │
             └──────────┬──────────────┘
                        ▼
              Firebase Firestore
         (halaqat / students / reports)
```

- **لا React Router** — التنقل عبر `view: 'student' | 'admin'`
- **لا مكتبة حالة عامة** — كل المنطق في `App.tsx`
- **Firestore offline** — `persistentLocalCache` مع دعم تعدد التبويبات

---

## سكربتات npm

| الأمر | الوظيفة |
|-------|---------|
| `npm run dev` | خادم التطوير (منفذ 3000) |
| `npm run build` | بناء الإنتاج |
| `npm run preview` | معاينة البناء |
| `npm run lint` | فحص الأنواع (`tsc --noEmit`) |
| `npm run clean` | حذف مجلد `dist` |

---
