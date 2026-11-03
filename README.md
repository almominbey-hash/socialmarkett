# socialmarket

Front end: plain HTML/CSS/JS (index.html, css/, js/, pages/). Works on GitHub Pages.
Back end: Supabase (database, login, file storage). Full setup steps in Urdu: SETUP-URDU.md.

Files:
- supabase/schema.sql   all tables, access rules and storage folders (run once in Supabase SQL Editor)
- js/00-supabase.js     put your Project URL and anon key here
- SETUP-URDU.md         step by step guide

To test on your computer: open a terminal in this folder and run `python -m http.server 8000`, then open http://localhost:8000

Clean URLs: pages live at /youtube, /sell, /login, /privacy, /terms ... (no # and no index.html).
Each route has a small file in the root (youtube.html, sell.html ...) so GitHub Pages serves /youtube directly. 404.html is the fallback. If you add a new route, copy index.html to <name>.html.
