# سعودي ترند — موقع الوكالة (Crew UI)

واجهة عربية RTL مستوحاة من تصميم **Crew UI**، بهوية **سعودي ترند** (اللوجو من ملف العقد).

## الروابط المحلية

```bash
python3 -m http.server 8000
```

| الصفحة | الرابط |
|--------|--------|
| **الرئيسية (Crew UI)** | http://localhost:8000/ |
| النسخة الكلاسيكية | http://localhost:8000/classic.html |
| Demo 1 | http://localhost:8000/demo.html |
| Demo 2 | http://localhost:8000/demo2.html |

## الهيكل

```
├── index.html          # الموقع الرئيسي (Crew UI × سعودي ترند)
├── classic.html        # النسخة الكلاسيكية السابقة
├── css/crew.css
├── js/crew.js
└── assets/
    ├── saudi-trend-logo.png
    └── eye.svg
```

## التخصيص

- الألوان في `:root` داخل `css/crew.css`
- بيانات التواصل في تذييل `index.html`
