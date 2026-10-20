# Aura landing page — دليل سريع

## الملفات
- `index.html` الصفحة كلها. كل الإعدادات في `const CONFIG` قرب آخر الملف.
- `vercel.json` إعدادات Vercel (روابط نظيفة + كاش للصور).
- `assets/img/` الصور (غلاف الفيديو، صورتك، صورة المشاركة og.jpg)
- `assets/img/testimonials/` صور/سكرينشوتات آراء العملاء
- `assets/video/` فيديوهات صغيرة لو هترفعها بنفسك (الأفضل يوتيوب/فيميو)

## اللي بتغيره في CONFIG
- `vslUrl` لينك الفيديو (YouTube / Vimeo / Loom / Drive) أو `/assets/video/vsl.mp4`
- `vslPoster` صورة غلاف للفيديو (اختياري)
- `bookingUrl` لينك حدث Calendly
- `whatsapp` رقمك بالكود الدولي (اختياري)
- `media` صور وفيديوهات الخانات A/B/C/D
- `testimonials` آراء العملاء — القسم بيفضل مخفي لحد ما تضيف واحد

قواعد: أسماء الملفات إنجليزي صغير بدون مسافات (ahmed-dubai.jpg)، والمسار يبدأ بـ `/assets/`.
صور: JPG/WebP أقل من 300KB. فيديو على Vercel: يُفضّل أقل من ~20MB، والأطول على يوتيوب (Unlisted) أو Vimeo.
