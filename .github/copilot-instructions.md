## PowerDeleteSuite — Copilot instructions

Short, focused notes to help an AI agent be immediately productive editing this repo.

1) Big picture (what this code does)
   - Single-page client-side bookmarklet / userscript that runs on old.reddit.com user overview.
   - Main app is the global `pd` object in `powerdeletesuite.js`. There is no backend — all actions use Reddit JSON endpoints.
   - UI markup is pulled at runtime from the subreddit wiki (`/r/PowerDeleteSuite/wiki/centralform.json`) and CSS is fetched from a raw JSON stylesheet URL.

2) Key files to read first
   - `powerdeletesuite.js` — the entire app (init, settings, endpoints, UI binders, filters, deletion/edit flows).
   - `bookmarklet.js` and `powerdeletesuite.user.js` — wrappers / distribution formats (bookmarklet and userscript headers).
   - `README.md` — install & usage instructions and the bookmarklet snippet users copy.
   - `stylesheet.json` — repository copy of stylesheet data referenced by the app.

3) Architecture & runtime patterns (concrete)
   - Global object `pd` holds version (pd.version), bookmarklet version (pd.bookmarkver), config, endpoints, and runtime state.
   - Uses jQuery (`$`) and `$.ajax(...).then(success, failure)` style rather than fetch/async/await.
   - Reddit integration: calls to endpoints like `/user/<user>/comments/.json`, `/user/<user>/submitted/.json`, and `/search.json`.
   - Settings and simple persistence: `localStorage` keys (e.g., `pd_ver`) and DOM parsing to extract Reddit modhash (`#config`).

4) Developer workflows / testing (how to verify changes)
   - No build step. Edit `powerdeletesuite.js` directly.
   - To test locally: serve the repo and load the script in the browser (or paste the script into the console on your own Reddit overview).
     Example quick serve (PowerShell):
     ```powershell
     python -m http.server 8000
     # then open https://old.reddit.com/u/me/overview and paste a modified bookmarklet that fetches your local URL
     ```
    - Included test harness: a small local browser-based harness lives in `test/` that simulates two Reddit resources and runs quick smoke checks.
       Files:
       - `test/server.js` — minimal Node static server (serves repo root, `powerdeletesuite.js`, and `test/data/*`).
       - `test/index.html` — harness page that creates minimal DOM, loads the script, stubs wiki/CSS fetches, and reports PASS/FAIL.
       - `test/data/*` — JSON stubs: `centralform.json` and `stylesheet.json`.
       Run the harness (PowerShell / pwsh):
       ```powershell
       # start the test server (requires Node.js on PATH)
       node .\test\server.js
       # open http://localhost:8000/ in a browser and observe PASS/FAIL results
       ```
       If you don't have Node available, you can still run the harness manually by opening `test/index.html` in a browser and serving `powerdeletesuite.js` via any static server.
   - Typical dev checklist when changing behavior:
     - bump `pd.version` (and optionally `pd.bookmarkver` if bookmarklet string changes)
     - update the README bookmarklet snippet if you changed the hosted/URL behavior
     - smoke test on `https://old.reddit.com/u/me/overview` and exercise: load comments, run filter, attempt an edit and a delete flow

5) Conventions and fragile/important details (do not change lightly)
   - Identity check: `pd.checks.location()` compares DOM username text to header link. If you change selectors, tests will break.
   - `pd.setup.applyCentral()` and `pd.setup.applyStyles()` fetch remote wiki and stylesheet JSON — UI is wiki-driven. Be aware of CORS and network failures.
   - `pd.editStrings` is the in-file list of candidate edit texts; changing it affects edit behavior.
   - Modhash extraction uses `#config` innerHTML parsing — this is brittle; prefer keeping the same extraction if possible.

6) Helpful code examples (copy/paste pointers)
   - Where endpoints are defined: in `powerdeletesuite.js` -> `pd.setup.basicSettings()` (look for `pd.endpoints`).
   - Where UI is filled from the wiki: `pd.setup.applyCentral()`.
   - Where CSS is injected: `pd.setup.applyStyles()` — it expects JSON with `data.stylesheet`.

7) Common failure modes to watch for
   - Empty or changed Reddit DOM selectors (username, #config) — will make the script refuse to run.
   - Remote wiki or stylesheet fetch failures — script alerts on failure; add robust fallbacks if needed.
   - Running on the wrong reddit domain (new reddit) — script explicitly checks for `old.reddit.com` style overview path.

8) Pull request checklist for code changes
   - Update `pd.version` for user-facing changes; bump `pd.bookmarkver` only when bookmarklet install string in `README.md` must change.
   - Mention in PR description how you tested on `old.reddit.com/u/me/overview` and what flows you exercised (comments, submissions, search, edit+delete order).

If anything above is unclear or you'd like me to add quick local launch scripts (or a tiny test runner that simulates Reddit JSON responses), tell me which part to expand and I will update this file.
