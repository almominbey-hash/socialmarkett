# socialmarket

How to run (VS Code):
1. Open this folder in VS Code (File > Open Folder).
2. Install the "Live Server" extension (Ritwick Dey).
3. Right click index.html > "Open with Live Server".

Without VS Code: open a terminal in this folder and run `python -m http.server 8000`, then open http://localhost:8000

Folders:
- index.html        top bar, category bar and the empty page area
- css/style.css     styles shared by the whole site
- pages/            one .html and one .css per page (landing, start, account, messages, order, sell, login, dash, saved, verify)
- js/               the code, split by page and job (files are numbered in the order they load)
- js/loader.js      loads the pages and then the js files
