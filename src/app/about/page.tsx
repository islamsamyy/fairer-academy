'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let v = 0;
    const step = to / 80;
    const t = setInterval(() => {
      v += step;
      if (v >= to) { setVal(to); clearInterval(t); } else setVal(Math.floor(v));
    }, 20);
    return () => clearInterval(t);
  }, [inView, to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}


type PBlock =
  | { t: 'h'; c: string }
  | { t: 'p'; c: string }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'table'; headers: string[]; rows: string[][] }
  | { t: 'alert'; v: 'warn' | 'ok' | 'err'; c: string };

const policyDocs: { id: string; ar: string; en: string; num: string; blocks: PBlock[] }[] = [
  {
    id: 'att', ar: 'لائحة الحضور والانصراف والغياب', en: 'Attendance, Absence & Academic Dismissal Policy', num: 'FAiRER-ATT-003',
    blocks: [
      { t: 'h', c: 'أولاً: مبادئ الحضور وأهميته' },
      { t: 'p', c: 'يُعدّ الحضور المنتظم ركيزةً أساسية في منظومة التعليم المدمج المعتمدة بأكاديمية فايرير. تُطبَّق هذه اللائحة على جميع طلاب برنامجَي دبلوم وماجستير علم الأنباط السعودي.' },
      { t: 'h', c: 'ثانياً: توزيع الحضور حسب نمط التعليم' },
      { t: 'table', headers: ['نوع الحضور', 'نسبة الإلزام', 'الآلية', 'الجهة المُشرفة'], rows: [
        ['التعلم الإلكتروني (أون لاين)', '80% من المقرر', 'المنصة الإلكترونية', 'القسم التقني'],
        ['الحضور الفعلي في المقر', '20% من المقرر', 'البصمة / الحضور اليدوي', 'إدارة الطلاب'],
        ['الاختبارات النهائية', '100% حضوري إلزامي', 'مقر الأكاديمية—تبوك', 'القسم الأكاديمي'],
        ['التدريب الميداني', '100% حضوري إلزامي', 'المواقع الأثرية المحددة', 'المشرف الميداني'],
      ]},
      { t: 'h', c: 'ثالثاً: آليات تسجيل الحضور' },
      { t: 'ul', items: [
        'يُسجَّل الحضور الإلكتروني تلقائياً عبر نظام الدخول الموحد (SSO).',
        'يُسجَّل الحضور الفعلي ببصمة الإصبع أو مسح بطاقة الهوية عند بوابة المدخل.',
        'يُوثَّق الحضور الميداني بتوقيع الطالب في الكشف الورقي وتأكيد المشرف رقمياً.',
        'تُرسَل تقارير الحضور الأسبوعية تلقائياً إلى الطالب ووليّ أمره (للطلاب دون 25 عاماً).',
      ]},
      { t: 'h', c: '3.2 توقيت الحضور' },
      { t: 'table', headers: ['الحالة', 'الحكم'], rows: [
        ['الحضور قبل بدء المحاضرة أو خلال أول 10 دقائق', 'حاضر'],
        ['الحضور بعد 10 دقائق وقبل نصف المحاضرة', 'متأخر (يُحتسب نصف غياب)'],
        ['الحضور بعد مرور أكثر من نصف مدة المحاضرة', 'غائب'],
        ['الخروج قبل انتهاء المحاضرة دون إذن', 'غياب جزئي (يُحتسب نصف غياب)'],
      ]},
      { t: 'h', c: 'رابعاً: حالات الغياب المبرَّر المقبولة' },
      { t: 'ul', items: [
        'المرض الموثَّق بتقرير طبي رسمي من مستشفى حكومي أو مركز صحي معتمد.',
        'وفاة أحد الأقارب من الدرجة الأولى (الوالدان — الأبناء — الزوج/الزوجة — الإخوة).',
        'المهام الرسمية الحكومية والعسكرية الموثَّقة بأمر مهمة رسمي.',
        'الكوارث الطبيعية أو الطوارئ الموثَّقة التي تحول دون الوصول.',
        'تأدية فريضة الحج (مرة واحدة طوال مدة الدراسة) بشرط إشعار مسبق.',
      ]},
      { t: 'h', c: '4.2 إجراء توثيق الغياب المبرَّر' },
      { t: 'ol', items: [
        'تقديم المستند المثبت خلال 72 ساعة من انتهاء سبب الغياب.',
        'رفع الطلب عبر بوابة الطالب الإلكترونية مع إرفاق المستندات الرقمية.',
        'مراجعة لجنة الشؤون الأكاديمية وإصدار قرار خلال 3 أيام عمل.',
        'في حال القبول، تُمنح الجلسة العلاجية بديلاً عن المحتوى الفائت.',
      ]},
      { t: 'h', c: 'خامساً: نسب الغياب والعواقب الأكاديمية' },
      { t: 'alert', v: 'warn', c: 'تُحتسب جلستان متأخرتان (نصف غياب × 2) بما يعادل غياباً كاملاً واحداً في سجل الطالب.' },
      { t: 'table', headers: ['نسبة الغياب', 'الحالة الأكاديمية', 'الإجراء', 'قابلية الاسترداد'], rows: [
        ['0% – 15%', 'سليم أكاديمياً', 'لا إجراء', '—'],
        ['16% – 20%', 'تحذير أول', 'إشعار كتابي + تنبيه', 'نعم'],
        ['21% – 25%', 'تحذير ثانٍ — إنذار', 'خطاب إنذار رسمي', 'نعم، مشروط'],
        ['أكثر من 25%', 'حرمان من الاختبار', 'لا يحق دخول الاختبار النهائي', 'لا'],
        ['أكثر من 40%', 'رسوب تلقائي', 'رسوب في المقرر وإعادته', 'يُحسب مقرراً إضافياً'],
      ]},
      { t: 'alert', v: 'err', c: 'الحرمان نهائي: الطالب الذي تتجاوز نسبة غيابه 25% لا يُسمح له بدخول الاختبار النهائي تحت أي ظرف، حتى مع الأعذار.' },
      { t: 'h', c: 'سادساً: الغش في الاختبارات وعقوباته' },
      { t: 'table', headers: ['التكرار', 'صورة الغش', 'العقوبة الفورية', 'التسجيل الرسمي'], rows: [
        ['الأول', 'غش في تكليف أو اختبار فصلي', 'صفر في التكليف + إنذار كتابي', 'يُوثَّق في ملف الطالب'],
        ['الثاني', 'غش في اختبار آخر أو انتحال', 'صفر في المقرر كاملاً', 'تبليغ مجلس الإدارة'],
        ['الثالث', 'غش في اختبار نهائي أو رسالة', 'فصل فصل دراسي كامل', 'تجميد السجل'],
        ['الرابع أو تزوير وثائق', 'أي نوع غش متكرر', 'فصل دائم من الأكاديمية', 'بلاغ للجهات المختصة'],
      ]},
      { t: 'h', c: 'سابعاً: المرافق الداعمة لشروط الاعتماد' },
      { t: 'table', headers: ['المرفق', 'المواصفات والتفاصيل'], rows: [
        ['المبنى الأكاديمي', 'فيلا مستقلة — 3 أدوار — مساحة 440 م²'],
        ['مداخل الطوارئ', 'درجَا طوارئ مستقلان + مصعد معتمد'],
        ['أنظمة الحريق', 'منظومة إطفاء وإنذار مركزية معتمدة من الدفاع المدني'],
        ['الحديقة / الفضاء الخارجي', 'حديقة خارجية ملحقة بالمبنى تُضاف إلى مساحة الموقع'],
        ['البنية التحتية التقنية', 'شبكة إنترنت مخصصة فائقة السرعة + قاعة حاسوب + منصة تعلم إلكتروني'],
        ['الموقع الإلكتروني', 'موقع خاص ببرمجة مخصصة وفريق تقني متكامل'],
        ['بطاقات الاعتماد', 'بطاقات هوية أكاديمية ذكية للطلاب والمنسوبين'],
      ]},
      { t: 'alert', v: 'ok', c: 'وافقت وزارة الثقافة على الاشتراطات الإنشائية ومنحت الأكاديمية ترخيص الاعتماد استناداً إلى مساحة المبنى البالغة 440 م².' },
    ],
  },
  {
    id: 'reg', ar: 'اللوائح والقوانين الأكاديمية', en: 'Academic Regulations & Bylaws', num: 'FAiRER-REG-001',
    blocks: [
      { t: 'h', c: 'أولاً: أحكام عامة وتعريفات' },
      { t: 'p', c: 'تُصدر هذه اللائحة بموجب قرار مجلس إدارة أكاديمية فايرير وتُطبَّق على جميع برامجها الأكاديمية المعتمدة.' },
      { t: 'table', headers: ['المصطلح', 'التعريف'], rows: [
        ['الأكاديمية', 'أكاديمية فايرير للتدريب والتعليم العالي — رقم الرخصة 212001000270'],
        ['الطالب', 'كل شخص مسجَّل رسمياً في أحد برامج الأكاديمية المعتمدة'],
        ['المقرر', 'وحدة أكاديمية مستقلة بساعات معتمدة ومحتوى تعليمي محدد'],
        ['الساعة المعتمدة', 'وحدة قياس أكاديمية تعادل ساعة محاضرة أسبوعياً طوال الفصل الدراسي'],
        ['GPA', 'المعدل التراكمي المحسوب على نظام 5.00 نقاط'],
        ['التعلم المدمج', 'نمط تعليمي يجمع بين التعلم الإلكتروني والحضور الفعلي'],
      ]},
      { t: 'h', c: 'ثانياً: هيكل برنامج الدبلوم (87 ساعة معتمدة)' },
      { t: 'table', headers: ['المكوّن الأكاديمي', 'عدد المقررات', 'الساعات المعتمدة'], rows: [
        ['مقررات الأساس والمتطلبات الإلزامية', '16', '48'],
        ['مقررات التخصص الاختيارية', '8', '24'],
        ['مقررات الدعم والمهارات العامة', '4', '12'],
        ['مشروع التخرج / البحث العلمي', '1', '3'],
        ['المجموع الكلي للبرنامج', '29', '87'],
      ]},
      { t: 'h', c: 'ثالثاً: توزيع درجات التقييم' },
      { t: 'table', headers: ['عنصر التقييم', 'النسبة', 'ملاحظات'], rows: [
        ['الاختبارات الفصلية (اختباران على الأقل)', '30%', 'إلكتروني/حضوري'],
        ['التكاليف والمشاريع التطبيقية', '15%', 'أسبوعية ودورية'],
        ['الأبحاث والعروض التقديمية', '15%', 'حسب المقرر'],
        ['الاختبار النهائي (حضوري إلزامي)', '40%', 'في مقر الأكاديمية'],
      ]},
      { t: 'h', c: 'سلّم الدرجات والتقديرات' },
      { t: 'table', headers: ['التقدير', 'النسبة', 'نقاط GPA', 'الوضع الأكاديمي'], rows: [
        ['ممتاز', '90%–100%', '4.75–5.00', 'مقبول للدكتوراه'],
        ['جيد جداً مرتفع', '85%–89%', '3.75–4.74', 'الحد الأدنى للدكتوراه'],
        ['جيد جداً', '80%–84%', '3.50–3.74', 'مقبول للماجستير'],
        ['جيد', '70%–79%', '2.75–3.49', 'مقبول للماجستير'],
        ['مقبول', '60%–69%', '2.00–2.74', 'ناجح'],
        ['راسب', 'أقل من 60%', 'أقل من 2.00', 'إعادة المقرر'],
      ]},
      { t: 'h', c: 'رابعاً: شروط التقدم للدكتوراه' },
      { t: 'ul', items: [
        'الحصول على درجة الماجستير بتقدير لا يقل عن "جيد جداً مرتفع" بمعدل 3.75 من 5.00.',
        'نشر بحث علمي محكَّم واحد على الأقل قبل التقديم.',
        'تقديم خطة بحثية مفصلة معتمدة من مشرف أكاديمي.',
        'اجتياز اختبار قدرات البحث العلمي المتقدم بنسبة 80%.',
        'تقديم ثلاثة خطابات توصية من أساتذة متخصصين.',
        'إثبات الكفاءة اللغوية (العربية والإنجليزية).',
      ]},
      { t: 'alert', v: 'warn', c: 'لا يُقبل في الدكتوراه أي طالب حصل على "جيد جداً" فقط (3.50–3.74) — يُشترط "جيد جداً مرتفع" 3.75 فأكثر.' },
      { t: 'h', c: 'خامساً: اللجان الأكاديمية وصلاحياتها' },
      { t: 'table', headers: ['اللجنة', 'المهام والصلاحيات'], rows: [
        ['لجنة الخطة الدراسية', 'مراجعة المقررات وتحديثها سنوياً، اقتراح مقررات جديدة'],
        ['لجنة القبول والتسجيل', 'الإشراف على إجراءات القبول، البت في طلبات الاستثناء'],
        ['لجنة الشؤون الأكاديمية', 'النظر في التظلمات خلال 10 أيام، منح التأجيل'],
        ['لجنة الجودة والاعتماد', 'متابعة متطلبات الاعتماد المحلي والدولي'],
        ['لجنة مشاريع التخرج', 'الإشراف على البحوث والمشاريع النهائية'],
        ['لجنة النزاهة الأكاديمية', 'التحقيق في حالات الغش والانتحال، إصدار العقوبات'],
      ]},
      { t: 'h', c: 'سادساً: نسبة الانتحال المسموحة' },
      { t: 'table', headers: ['نوع العمل', 'الحد الأقصى', 'الإجراء عند التجاوز'], rows: [
        ['التكاليف الأسبوعية', '25%', 'إنذار + إعادة التسليم'],
        ['مشاريع الفصل', '20%', 'صفر + فرصة واحدة'],
        ['مشروع التخرج / الرسالة', '15%', 'رسوب + لجنة تحقيق'],
      ]},
      { t: 'h', c: 'سابعاً: شروط أعضاء هيئة التدريس' },
      { t: 'ul', items: [
        'الحصول على درجة الدكتوراه في التخصص من جامعة معترف بها.',
        'خبرة أكاديمية وبحثية موثقة لا تقل عن 3 سنوات.',
        'نشر ورقتين علميتين على الأقل في مجلات محكّمة.',
        'الحصول على تصاريح العمل النظامية اللازمة.',
        'التوقيع على عقد أكاديمي والالتزام بميثاق الشرف الأكاديمي.',
      ]},
      { t: 'h', c: 'ثامناً: إجراءات التظلم والاعتراض' },
      { t: 'ol', items: [
        'يقدّم الطالب تظلمه كتابياً خلال 10 أيام عمل من تاريخ القرار.',
        'تُحيل الإدارة التظلم إلى لجنة الشؤون الأكاديمية خلال يومَي عمل.',
        'تدرس اللجنة التظلم وتُصدر قرارها المُسبَّب خلال 10 أيام عمل.',
        'يحق التصعيد إلى مجلس الإدارة خلال 5 أيام كمرحلة استئناف نهائية.',
        'تُحفظ جميع وثائق التظلمات في السجلات الرسمية لمدة 5 سنوات.',
      ]},
    ],
  },
  {
    id: 'adm', ar: 'سياسة شروط القبول والتسجيل', en: 'Admission & Enrollment Policy', num: 'FAiRER-ADM-002',
    blocks: [
      { t: 'h', c: 'أولاً: شروط القبول في برنامج الدبلوم' },
      { t: 'ul', items: [
        'الحصول على شهادة الثانوية العامة بمعدل لا يقل عن 80%.',
        'عدم الانقطاع عن الدراسة لأكثر من 10 سنوات.',
        'إثبات الاهتمام الأكاديمي بمجال التراث والآثار أو التاريخ.',
        'اجتياز اختبار القبول المعتمد بنسبة لا تقل عن 60%.',
        'إجراء مقابلة شخصية حضورية أو عبر الفيديو أمام لجنة القبول.',
      ]},
      { t: 'h', c: 'المستندات المطلوبة للدبلوم' },
      { t: 'table', headers: ['#', 'المستند', 'ملاحظات'], rows: [
        ['1', 'صورة الهوية الوطنية أو الإقامة', 'مصوّرة وضوحاً'],
        ['2', 'شهادة الثانوية العامة', 'مصدَّقة من الجهة الرسمية'],
        ['3', 'كشف الدرجات الرسمي', 'مصدَّق ومختوم'],
        ['4', 'صورة شخصية حديثة (بخلفية بيضاء)', 'مقاس 4×6 سم'],
        ['5', 'السيرة الذاتية (CV)', 'لا تزيد عن 3 صفحات'],
        ['6', 'خطاب تحفيز (Statement of Purpose)', '400–600 كلمة'],
      ]},
      { t: 'h', c: 'ثانياً: شروط القبول في برنامج الماجستير' },
      { t: 'ul', items: [
        'البكالوريوس في التاريخ أو الآثار بمعدل لا يقل عن 3.00 من 5.00.',
        'يُفضَّل التخصص في العلوم الإنسانية أو الاجتماعية أو الثقافية.',
        'خطابا توصية أكاديمية من أستاذَين جامعيَّين متخصصَين.',
        'خطة بحثية مبدئية (Research Proposal) لا تقل عن 1000 كلمة.',
      ]},
      { t: 'h', c: 'ثالثاً: شروط قبول الدكتوراه' },
      { t: 'alert', v: 'warn', c: 'اشتراط حرج: لا يُقبَل في الدكتوراه أي طالب يقل معدله في الماجستير عن 3.75 من 5.00 — التقدير "جيد جداً" (3.50) وحده غير كافٍ.' },
      { t: 'ul', items: [
        'درجة الماجستير بمعدل تراكمي لا يقل عن 3.75 من 5.00 — شرط غير قابل للاستثناء.',
        'نشر ورقة بحثية علمية محكَّمة قبيل التقديم.',
        'اجتياز اختبار قدرات البحث العلمي المتقدم بنسبة 80% فأكثر.',
        'مقابلة أكاديمية متعمقة أمام لجنة متخصصة تضم ثلاثة أساتذة.',
        'ثلاثة خطابات توصية أكاديمية من أساتذة متخصصين.',
        'ورقة بحثية منشورة مع رقم DOI.',
      ]},
      { t: 'h', c: 'رابعاً: إجراءات القبول خطوة بخطوة' },
      { t: 'table', headers: ['الخطوة', 'الإجراء', 'المسؤول', 'المدة'], rows: [
        ['1', 'التقديم الإلكتروني عبر البوابة الرسمية', 'المتقدم', 'مفتوح'],
        ['2', 'مراجعة المستندات والتحقق', 'لجنة القبول', '3 أيام عمل'],
        ['3', 'إشعار المتقدم بالقبول الأولي', 'إدارة التسجيل', 'يوم عمل'],
        ['4', 'اختبار القبول إلكترونياً أو حضورياً', 'قسم الاختبارات', 'حسب الجدول'],
        ['5', 'المقابلة الشخصية (حضور/فيديو)', 'لجنة القبول', '3-5 أيام'],
        ['6', 'إصدار قرار القبول النهائي', 'مدير الأكاديمية', '5 أيام'],
        ['7', 'سداد الرسوم وإكمال التسجيل', 'المتقدم المقبول', '7 أيام'],
        ['8', 'استلام البريد الأكاديمي وبيانات المنصة', 'إدارة التقنية', 'يوم عمل'],
      ]},
      { t: 'h', c: 'خامساً: نمط التعليم المدمج' },
      { t: 'table', headers: ['مكوّن التعليم', 'النسبة', 'التفاصيل'], rows: [
        ['التعلم الإلكتروني (أون لاين)', '80%', 'عبر المنصة الإلكترونية للأكاديمية'],
        ['الحضور الفعلي في المقر', '20%', 'تبوك — الطابق الأول'],
        ['الاختبارات النهائية', '100% حضوري', 'في مقر الأكاديمية إلزامياً'],
        ['التدريب الميداني', '100% حضوري', 'المواقع الأثرية المحددة'],
      ]},
      { t: 'h', c: 'سادساً: سياسة الاسترداد' },
      { t: 'table', headers: ['توقيت الانسحاب', 'نسبة الاسترداد'], rows: [
        ['قبل بدء الفصل الدراسي', '100%'],
        ['خلال الأسبوع الأول', '75%'],
        ['خلال الأسبوعين الأول والثاني', '50%'],
        ['بعد الأسبوع الثاني', 'لا يُسترد'],
      ]},
      { t: 'h', c: 'سابعاً: الاعتراض على قرار الرفض' },
      { t: 'ol', items: [
        'تقديم اعتراض كتابي خلال 7 أيام عمل من تاريخ إشعار الرفض.',
        'تُحال الاعتراضات إلى لجنة مستقلة لا تضم أعضاء لجنة القبول الأصلية.',
        'تُصدر نتيجة الاعتراض خلال 10 أيام عمل، وقرارها نهائي.',
        'في حالات استثنائية، يحق التقديم للتسجيل في الفصل التالي دون رسوم إضافية.',
      ]},
    ],
  },
  {
    id: 'res', ar: 'لائحة مشروع التخرج والبحث العلمي', en: 'Graduation Project & Research Policy', num: 'FAiRER-RES-004',
    blocks: [
      { t: 'h', c: 'الباب الأول: مشروع التخرج (الدبلوم)' },
      { t: 'ol', items: [
        'يُعد مشروع التخرج متطلباً أساسياً للحصول على شهادة الدبلوم.',
        'يُعيّن لكل طالب مشرف أكاديمي من حملة الماجستير أو الدكتوراه.',
        'يُقدم الطالب مقترح المشروع للموافقة قبل بدء الفصل الأخير بشهر.',
        'يُناقش المشروع أمام لجنة تقييم من عضوين أكاديميين على الأقل.',
        'يُعد المشروع تطبيقياً ويتضمن جانباً عملياً واضحاً في مجال التخصص.',
      ]},
      { t: 'h', c: 'معايير تقييم مشروع التخرج' },
      { t: 'table', headers: ['المعيار', 'الوزن', 'التفاصيل'], rows: [
        ['أصالة الفكرة وجدتها', '15%', 'مدى ابتكارية المشروع وإضافته العملية'],
        ['المنهجية والتطبيق', '25%', 'سلامة المنهج العلمي وجودة التطبيق العملي'],
        ['جودة التقرير والتوثيق', '20%', 'التنظيم والكتابة العلمية والتوثيق السليم'],
        ['العرض والمناقشة', '20%', 'مهارات العرض والإجابة على أسئلة اللجنة'],
        ['التزام الطالب وإشراف المشرف', '10%', 'الانتظام في اللقاءات الإشرافية والمتابعة'],
        ['الأثر والقيمة المضافة', '10%', 'مدى فائدة المشروع لسوق العمل أو المجتمع'],
      ]},
      { t: 'h', c: 'الباب الثاني: رسالة الماجستير' },
      { t: 'ol', items: [
        'يُعيّن مشرف رئيسي من حملة الدكتوراه في التخصص.',
        'يُقدم الطالب مقترحاً بحثياً يُعتمد من المجلس الأكاديمي.',
        'تُناقش الرسالة أمام لجنة من ثلاثة أعضاء (المشرف + ممتحنان).',
        'يُشترط ألا تقل الرسالة عن 80 صفحة ولا تزيد عن 200 صفحة.',
        'يُشترط الالتزام بدليل كتابة الرسائل المعتمد من الأكاديمية.',
        'يُوصى بنشر بحث مستخلص من الرسالة في مجلة علمية محكمة.',
      ]},
      { t: 'h', c: 'الباب الثالث: أطروحة الدكتوراه' },
      { t: 'ol', items: [
        'يُعيّن مشرف رئيسي ومشرف مساعد من حملة الدكتوراه.',
        'يجتاز الطالب الامتحان الشامل قبل البدء بكتابة الأطروحة.',
        'يُشترط نشر بحثين علميين محكمين على الأقل قبل المناقشة النهائية.',
        'تُناقش الأطروحة أمام لجنة من خمسة أعضاء (المشرفان + 3 ممتحنين، أحدهم خارجي).',
        'يُشترط أن تُقدم الأطروحة إضافة علمية أصيلة وجديدة في مجال التخصص.',
        'يُشترط ألا تقل الأطروحة عن 150 صفحة.',
        'يحق للجنة: القبول، القبول مع تعديلات، إعادة المناقشة، أو الرفض.',
      ]},
    ],
  },
];

export default function AboutPage() {
  const { t } = useLanguage();
  const [activePolicyTab, setActivePolicyTab] = useState('att');

  const values = [
    { icon: 'star', label: t('about.val1Label'), body: t('about.val1Body'), color: 'from-amber-400 to-orange-500' },
    { icon: 'diversity_3', label: t('about.val2Label'), body: t('about.val2Body'), color: 'from-primary to-cyan-500' },
    { icon: 'verified', label: t('about.val3Label'), body: t('about.val3Body'), color: 'from-emerald-400 to-teal-500' },
    { icon: 'rocket_launch', label: t('about.val4Label'), body: t('about.val4Body'), color: 'from-violet-500 to-purple-700' },
  ];

  const team = [
    { name: t('about.team1Name'), role: t('about.team1Role'), avatar: '👨‍💼', bio: t('about.team1Bio') },
    { name: t('about.team2Name'), role: t('about.team2Role'), avatar: '🤝', bio: t('about.team2Bio') },
    { name: t('about.team3Name'), role: t('about.team3Role'), avatar: '👨‍💻', bio: t('about.team3Bio') },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative blob-bg mesh-gradient pt-32 pb-24 overflow-hidden">
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-cyan-300/20 rounded-full blur-[80px] animate-blob pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-400/15 rounded-full blur-[60px] animate-blob-delay pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 sm:px-8 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center">
            <motion.div variants={fadeUp} className="flex justify-center mb-6">
              <Image
                src="/logo.png"
                alt="جامعة فايرير السعودية"
                width={80}
                height={80}
                className="drop-shadow-[0_0_24px_rgba(0,200,255,0.55)] animate-float"
              />
            </motion.div>
            <motion.span variants={fadeUp} className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest uppercase mb-4">
              {t('about.tag')}
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-5xl sm:text-7xl font-heading font-black tracking-tighter text-on-background mb-6 leading-tight">
              {t('about.h1')}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light">
              {t('about.intro')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── ANIMATED STATS ── */}
      <section className="px-6 sm:px-8 py-16 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: 28000, suffix: '+', label: t('about.statLearners'), icon: 'groups', color: 'text-cyan-600', bg: 'bg-cyan-50' },
            { to: 320, suffix: '+', label: t('about.statInstructors'), icon: 'school', color: 'text-violet-600', bg: 'bg-violet-50' },
            { to: 480, suffix: '+', label: t('about.statCourses'), icon: 'menu_book', color: 'text-primary', bg: 'bg-primary/5' },
            { to: 94, suffix: '%', label: t('about.statJobs'), icon: 'work', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-glow rounded-2xl p-6 text-center card-hover-glow"
            >
              <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                <span className="material-symbols-outlined text-xl">{s.icon}</span>
              </div>
              <p className={`text-4xl font-heading font-black ${s.color}`}><Counter to={s.to} suffix={s.suffix} /></p>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-bold mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── MISSION & ACADEMY ── */}
      <section className="px-6 sm:px-8 py-16 max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass-glow p-10 rounded-3xl card-hover-glow"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-primary text-2xl">target</span>
          </div>
          <h2 className="text-2xl font-heading font-black text-on-background mb-4">{t('about.missionTitle')}</h2>
          <p className="text-muted-foreground leading-relaxed">{t('about.missionBody')}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-glow p-10 rounded-3xl card-hover-glow"
        >
          <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-secondary text-2xl">account_balance</span>
          </div>
          <h2 className="text-2xl font-heading font-black text-on-background mb-4">{t('about.academyTitle')}</h2>
          <p className="text-muted-foreground leading-relaxed">{t('about.academyBody')}</p>
        </motion.div>
      </section>

      {/* ── OUR VALUES ── */}
      <section className="px-6 sm:px-8 py-20 max-w-screen-xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-12 text-center">
          <motion.p variants={fadeUp} className="text-xs font-mono font-bold text-primary tracking-widest uppercase mb-2">{t('about.valuesTag')}</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl font-heading font-black tracking-tight text-on-background">{t('about.valuesTitle')}</motion.h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v, i) => (
            <motion.div
              key={v.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass-glow rounded-2xl p-7 text-center card-hover-glow"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${v.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <span className="material-symbols-outlined text-white text-2xl">{v.icon}</span>
              </div>
              <h3 className="font-heading font-black text-on-background text-lg mb-3">{v.label}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{v.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── VISION 2030 ── */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 my-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,104,123,0.25),transparent_70%)] pointer-events-none" />
        <div className="max-w-screen-xl mx-auto px-6 sm:px-8 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 text-white/70 font-mono text-xs font-bold tracking-widest uppercase mb-4">
              🇸🇦 {t('about.visionBadge')}
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-heading font-black text-white tracking-tighter leading-tight mb-4">
              <span className="gradient-text">{t('about.visionTitle')}</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/60 text-lg max-w-2xl mx-auto font-light">
              {t('about.visionBody')}
            </motion.p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: 'school', title: t('about.vision1Title'), body: t('about.vision1Body') },
              { icon: 'work', title: t('about.vision2Title'), body: t('about.vision2Body') },
              { icon: 'public', title: t('about.vision3Title'), body: t('about.vision3Body') },
            ].map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="glass-dark rounded-2xl p-7 card-hover-glow"
              >
                <span className="material-symbols-outlined text-secondary text-3xl mb-4 block">{p.icon}</span>
                <h3 className="font-heading font-black text-white text-xl mb-3">{p.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEADERSHIP TEAM ── */}
      <section className="px-6 sm:px-8 py-20 max-w-screen-xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-12 text-center">
          <motion.p variants={fadeUp} className="text-xs font-mono font-bold text-primary tracking-widest uppercase mb-2">{t('about.teamTag')}</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl font-heading font-black tracking-tight text-on-background">{t('about.teamTitle')}</motion.h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              whileHover={{ y: -6 }}
              className="glass-glow rounded-3xl p-8 text-center card-hover-glow"
            >
              <div className="text-6xl mb-4 animate-float" style={{ animationDelay: `${i * 0.6}s` }}>{member.avatar}</div>
              <h3 className="font-heading font-black text-xl text-on-background mb-1">{member.name}</h3>
              <p className="text-xs font-mono text-primary font-bold uppercase tracking-widest mb-3">{member.role}</p>
              <p className="text-muted-foreground text-sm">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ACADEMIC POLICIES ── */}
      <section className="px-6 sm:px-8 py-20 max-w-screen-xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="mb-10 text-center">
          <motion.p variants={fadeUp} className="text-xs font-mono font-bold text-primary tracking-widest uppercase mb-2">{t('about.policiesTag')}</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl font-heading font-black tracking-tight text-on-background">{t('about.policiesTitle')}</motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground mt-3 text-sm">{t('about.policiesSubtitle')}</motion.p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {policyDocs.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePolicyTab(p.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activePolicyTab === p.id ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'glass-glow text-muted-foreground hover:text-primary'}`}
            >
              {p.ar}
            </button>
          ))}
        </div>

        {(() => {
          const doc = policyDocs.find(p => p.id === activePolicyTab) ?? policyDocs[0];
          return (
            <motion.div
              key={activePolicyTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-glow rounded-3xl p-8"
              dir="rtl"
            >
              <div className="mb-6 pb-6 border-b border-primary/10">
                <span className="text-xs font-mono text-muted-foreground">{doc.num} | الإصدار الأول | 1447هـ — 2026م</span>
                <h3 className="text-2xl font-black text-on-background mt-1 font-heading">{doc.ar}</h3>
                <p className="text-primary text-sm font-mono">{doc.en}</p>
              </div>
              {doc.blocks.map((block, i) => {
                if (block.t === 'h') return <h4 key={i} className="text-base font-black text-primary mt-6 mb-3 border-r-4 border-primary pr-3">{block.c}</h4>;
                if (block.t === 'p') return <p key={i} className="text-muted-foreground text-sm leading-relaxed mb-4">{block.c}</p>;
                if (block.t === 'ul') return <ul key={i} className="space-y-1.5 mb-4 mr-4">{block.items.map((it, j) => <li key={j} className="flex gap-2 text-sm text-muted-foreground"><span className="text-primary mt-0.5 shrink-0">•</span>{it}</li>)}</ul>;
                if (block.t === 'ol') return <ol key={i} className="space-y-1.5 mb-4 mr-4">{block.items.map((it, j) => <li key={j} className="flex gap-2 text-sm text-muted-foreground"><span className="text-primary font-bold shrink-0">{j + 1}.</span>{it}</li>)}</ol>;
                if (block.t === 'table') return (
                  <div key={i} className="overflow-x-auto mb-5 rounded-xl border border-white/10">
                    <table className="w-full text-sm border-collapse">
                      <thead><tr>{block.headers.map((h, j) => <th key={j} className="bg-primary/10 text-primary px-3 py-2.5 text-right font-bold text-xs">{h}</th>)}</tr></thead>
                      <tbody>{block.rows.map((row, j) => (
                        <tr key={j} className={j % 2 === 0 ? '' : 'bg-white/5'}>
                          {row.map((cell, k) => <td key={k} className="px-3 py-2 text-muted-foreground text-xs border-t border-white/5">{cell}</td>)}
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                );
                if (block.t === 'alert') {
                  const s = block.v === 'warn' ? 'bg-amber-500/10 border-amber-500/30 text-amber-700' :
                            block.v === 'ok'   ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700' :
                                                 'bg-red-500/10 border-red-500/30 text-red-700';
                  const icon = block.v === 'warn' ? '⚠️' : block.v === 'ok' ? '✅' : '🚫';
                  return <div key={i} className={`${s} border rounded-xl px-4 py-3 text-sm mb-4 flex gap-2`}><span>{icon}</span><span>{block.c}</span></div>;
                }
                return null;
              })}
              <div className="mt-8 pt-6 border-t border-primary/10 grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div><span className="text-xs font-mono text-primary block mb-1">المدير التنفيذي</span>م. إسلام سامي</div>
                <div><span className="text-xs font-mono text-primary block mb-1">نائب المدير والمؤسس</span>عبدالعزيز الفايـر</div>
              </div>
            </motion.div>
          );
        })()}
      </section>

      {/* ── CTA ── */}
      <section className="px-6 sm:px-8 py-20 max-w-screen-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden bg-gradient-to-br from-primary/8 to-secondary/8 p-16 rounded-[3rem] border border-primary/10 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,217,255,0.08),transparent_70%)] pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl font-heading font-black text-on-background tracking-tight">{t('about.ctaTitle')}</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">{t('about.ctaBody')}</p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link href="/courses" className="px-10 py-4 bg-primary text-white rounded-2xl font-heading font-black hover:scale-105 transition-transform shadow-xl shadow-primary/25">{t('about.ctaExplore')}</Link>
              <Link href="/support/contact" className="px-10 py-4 glass-glow rounded-2xl font-heading font-black hover:bg-white transition-all">{t('about.ctaContact')}</Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
