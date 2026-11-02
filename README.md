# socialmarket

Front end: plain HTML/CSS/JS (index.html, css/, js/, pages/). Works on GitHub Pages.
Back end: Supabase (database, login, file storage). Full setup steps in Urdu: SETUP-URDU.md.

Files:
- supabase/schema.sql   all tables, access rules and storage folders (run once in Supabase SQL Editor)
- js/00-supabase.js     put your Project URL and anon key here
- SETUP-URDU.md         step by step guide

To test on your computer: open a terminal in this folder and run `python -m http.server 8000`, then open http://localhost:8000
- admin.html           admin panel (approve sellers and listings)
- supabase/admin.sql   run once after schema.sql to enable the admin panel
