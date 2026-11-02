# socialmarket بیک اینڈ سیٹ اپ (اردو گائیڈ)

## بنیادی بات
آپ کی سائٹ GitHub Pages پر ہے۔ وہاں صرف سائٹ کی فائلیں رہتی ہیں۔ یوزرز کا ڈیٹا، لاگ اِن، آئی ڈی کی تصاویر اور میسجز محفوظ کرنے کے لیے الگ جگہ چاہیے۔ وہ جگہ **Supabase** ہے (مفت)۔

آسان مثال:
- **GitHub** = دکان کی عمارت (جو لوگ دیکھتے ہیں)
- **Supabase** = دکان کا گودام اور رجسٹر (جہاں سارا ڈیٹا رہتا ہے)

آپ کو کوئی ڈیٹا خود نہیں ڈالنا۔ سب ٹیبلز `supabase/schema.sql` میں تیار ہیں۔ آپ کو صرف 5 کام کرنے ہیں۔

---

## کام 1: Supabase پر اکاؤنٹ اور پروجیکٹ بنانا
1. براؤزر میں **supabase.com** کھولیں۔
2. **Start your project** دبائیں اور GitHub یا ای میل سے سائن اپ کریں۔
3. **New project** دبائیں۔
4. Name میں `socialmarket` لکھیں۔
5. **Database Password** بنائیں اور کہیں محفوظ لکھ لیں۔
6. Region میں **Singapore** یا **Mumbai** چنیں (پاکستان کے قریب)۔
7. **Create new project** دبائیں اور 2 منٹ انتظار کریں۔

## کام 2: ڈیٹا بیس بنانا (ایک بار)
1. بائیں طرف مینو میں **SQL Editor** (نشان `>_`) دبائیں۔
2. **New query** دبائیں۔
3. زپ کھول کر `supabase` فولڈر میں `schema.sql` فائل کو Notepad میں کھولیں۔
4. سارا متن کاپی کریں (Ctrl+A پھر Ctrl+C)۔
5. Supabase کی خالی جگہ میں پیسٹ کریں (Ctrl+V)۔
6. نیچے دائیں **Run** دبائیں۔
7. "Success. No rows returned" آنا چاہیے۔ یہ کام ایک ہی بار کرنا ہے۔

## کام 3: دو چابیاں کاپی کرنا
1. Supabase میں بائیں نیچے **Project Settings** (گیئر کا نشان) دبائیں۔
2. **API** (یا **Data API**) والا حصہ کھولیں۔
3. وہاں دو چیزیں ملیں گی:
   - **Project URL**: `https://xxxxxxxx.supabase.co` جیسا لنک
   - **anon public key**: بہت لمبا متن جو `eyJ...` سے شروع ہوتا ہے
4. دونوں کسی Notepad میں کاپی کر کے رکھ لیں۔

خبردار: `service_role` والی چابی کبھی سائٹ میں نہ ڈالیں۔ صرف `anon public` ڈالنی ہے۔

## کام 4: سائٹ کی فائلیں GitHub پر ڈالنا اور چابیاں لگانا
**پہلے زپ کھولیں:** `socialmarket_v16_backend.zip` پر رائٹ کلک کریں، Extract All کریں۔ ایک فولڈر `socialmarket` بنے گا۔

**چابیاں لگانا (کمپیوٹر پر):**
1. فولڈر `socialmarket` کھولیں، اس میں `js` فولڈر، اس میں فائل **`00-supabase.js`**۔
2. اسے Notepad میں کھولیں۔ شروع میں دو لائنیں ہیں:
```js
var SUPABASE_URL="PASTE_YOUR_PROJECT_URL";
var SUPABASE_ANON_KEY="PASTE_YOUR_ANON_KEY";
```
3. پہلی میں `PASTE_YOUR_PROJECT_URL` مٹا کر اپنا Project URL لکھیں۔ دوسری میں `PASTE_YOUR_ANON_KEY` مٹا کر anon key لکھیں۔ دونوں اسی طرح ڈبل کوٹس " " کے اندر رہیں۔
4. Save کریں۔

**GitHub پر ڈالنا:**
1. github.com پر اپنی سائٹ والی repository کھولیں۔
2. پرانی فائلیں ہٹا دیں (ہر فائل کھول کر ڈیلیٹ کا نشان) یا سب کو نئی فائلوں سے بدل دیں۔
3. **Add file > Upload files** دبائیں۔
4. فولڈر `socialmarket` کے **اندر کی** چیزیں (فولڈر خود نہیں) کھینچ کر ڈالیں: `index.html`, `css`, `js`, `pages`, `supabase`, `README.md`, `SETUP-URDU.md`۔ سب سے اہم بات: `index.html` repository کی سب سے اوپر والی سطح پر ہو۔
5. نیچے **Commit changes** دبائیں۔
6. 1 سے 2 منٹ بعد سائٹ اپ ڈیٹ ہو جائے گی۔

## کام 5: Supabase کو اپنی سائٹ کا پتہ بتانا
1. Supabase میں **Authentication** دبائیں۔
2. **URL Configuration** کھولیں۔
3. **Site URL** میں اپنی سائٹ لکھیں، مثلاً `https://yourdomain.com`۔
4. **Redirect URLs** میں **Add URL** دبا کر لکھیں: `https://yourdomain.com/**`۔
5. Save کریں۔

**ای میل کی تصدیق:** **Authentication > Sign In / Providers > Email** میں "Confirm email" کا آپشن ہے۔
- پہلے ٹیسٹ کرنے کے لیے اسے بند (off) کر دیں۔
- لائیو ہونے سے پہلے اسے آن کریں اور **Authentication > SMTP Settings** میں اپنا ای میل سروس (Resend یا Brevo، مفت) جوڑیں۔ Supabase کی اپنی مفت ای میل گھنٹے میں بہت کم ای میلز بھیجتی ہے۔

**گوگل لاگ اِن (اختیاری):** جب تک **Providers > Google** میں Google Cloud کی Client ID نہ ڈالیں، "Continue with Google" کام نہیں کرے گا۔ پہلے ای میل سے چلائیں۔

---

## ٹیسٹ کیسے کریں
1. اپنی سائٹ کھولیں، نیا اکاؤنٹ بنائیں۔
2. "Become a Seller" دبائیں، ویریفکیشن بھریں۔
3. اکاؤنٹ لسٹ کریں۔

اگر کچھ نہ چلے تو براؤزر میں F12 دبا کر **Console** کا سرخ پیغام مجھے بھیج دیں۔

---

## آپ (ایڈمن) کا روزمرہ کام
سارا کام Supabase کے اندر ہوتا ہے:

- **سیلر کی آئی ڈی دیکھنا:** **Table Editor > seller_verifications** میں نام، فون، آئی ڈی نمبر، پے آؤٹ۔ تصاویر **Storage > kyc** میں۔
- **سیلر کو منظور کرنا** (SQL Editor میں چلائیں):
```sql
update public.profiles set kyc_status = 'verified' where email = 'seller@email.com';
```
- **مسترد کرنا** (وہ دوبارہ فارم بھر سکتا ہے):
```sql
update public.profiles set kyc_status = 'rejected' where email = 'seller@email.com';
```
- **لسٹنگ لائیو کرنا:** نئی لسٹنگ پہلے "In review" ہوتی ہے۔ خریداروں کو تب دکھتی ہے جب آپ لائیو کریں۔
```sql
update public.listings set status = 'live' where id = 'لسٹنگ کی id';
```
(لسٹنگ کی id اور اکاؤنٹ کا اصل لنک **Table Editor > listings** میں ہوتا ہے۔ اصل لنک صرف آپ دیکھ سکتے ہیں۔)

---

## کیا کام کرتا ہے اور کیا باقی ہے
**کام کرتا ہے:** سائن اپ، لاگ اِن، پاس ورڈ ری سیٹ، سیلر ویریفکیشن، لسٹنگ بنانا، لائیو لسٹنگز کا براؤز پیج پر آنا، ہر اکاؤنٹ کا اپنا تفصیلی پیج (اسکرین شاٹس کے ساتھ)، سیوڈ لسٹ، ڈیش بورڈ، اور **خریدار اور سیلر کی اصل دو طرفہ چیٹ**۔

**ابھی باقی:** **ادائیگی اور آرڈرز۔** "Buy now" کی جگہ ابھی "Payments opening soon" لکھا ہے، اور Orders پیج خالی ہے۔ اصل پیمنٹ کے لیے پیمنٹ سروس چاہیے۔ پاکستان سے یہ سب سے مشکل حصہ ہے (Stripe پاکستان میں دستیاب نہیں)، اس لیے پہلے یہ طے کرنا ہوگا کہ رقم کس راستے سے آئے گی۔

---

## ایڈمن پینل (آئی ڈی اور لسٹنگ منظور کرنے کے لیے)

**پینل کا پتہ:** `https://آپ کا ڈومین/admin.html`

### ایک بار کا سیٹ اپ
1. Supabase میں **SQL Editor** کھولیں، **New query** دبائیں۔
2. فائل `supabase/admin.sql` کا سارا متن کاپی کر کے پیسٹ کریں اور **Run** دبائیں۔ "Success" آنا چاہیے۔
3. اپنی سائٹ پر اپنے ای میل سے عام اکاؤنٹ بنائیں (اگر پہلے سے ہے تو یہ قدم چھوڑ دیں)۔
4. SQL Editor میں نئی query کھولیں اور یہ لکھ کر Run کریں (ای میل اپنی لکھیں):
```sql
insert into public.admins (user_id)
select id from auth.users where email = 'آپ کا ای میل'
on conflict do nothing;
```
5. "Success. 1 row" یا اس جیسا پیغام آئے تو آپ ایڈمن بن گئیں۔

### روزانہ کا کام
- `admin.html` کھولیں، اپنے ای میل اور پاس ورڈ سے لاگ اِن کریں۔
- **Seller IDs:** نام، فون، آئی ڈی نمبر دیکھیں۔ **Show ID photos** سے تصاویر دیکھیں۔ پھر **Approve seller** یا **Reject** دبائیں۔
- **Listings:** تفصیل، اکاؤنٹ کا اصل لنک اور اسکرین شاٹس دیکھیں۔ ٹھیک ہو تو **Make live** دبائیں۔ ورنہ **Reject**۔
- اوپر سرخ نمبر بتاتا ہے کتنے کام انتظار میں ہیں۔

خبردار: صرف وہی لوگ پینل میں کام کر سکتے ہیں جو `admins` ٹیبل میں ہوں۔ باقی لوگ صفحہ کھولیں بھی تو انہیں کچھ نظر نہیں آئے گا اور کوئی بٹن کام نہیں کرے گا۔
