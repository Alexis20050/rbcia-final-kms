# VERITAS CORE — standalone frontend demo

A browser-only recreation of the RBCIA Accounting Firm workspace. The application uses HTML, CSS, and vanilla JavaScript with fictional Philippine business data. It does not connect to the Laravel application, a database, or any external API.

## Launch

Open `index.html` directly in a modern browser. No build process or backend is needed. A local static server also works, for example `python -m http.server 8000` from this folder and then `http://localhost:8000`.

The Manrope web font is optional; the interface falls back to system fonts offline. Demo records are stored in browser `localStorage` under `veritas-core-demo-v1`.

## Demo sign-in

Select a role on the sign-in screen or use one of these fictional accounts. Any nonempty password works in this demo.

| Role | Email |
|---|---|
| Owner | `owner@demo.veritas.local` |
| Office Manager | `manager@demo.veritas.local` |
| Bookkeeper | `bookkeeper@demo.veritas.local` |

Use Profile → Log out to switch roles. A second bookkeeper, `lea@demo.veritas.local`, is also seeded to demonstrate client assignments and independent review. Demo login and permissions are **interface simulations**, not secure authentication or server authorization.

## What is included

- 25 fictional clients; four fictional staff accounts; client assignments and onboarding checklists.
- 50 document records; five document requirement templates; 75 client requirements. Local file upload stores small files in this browser; text, images, and PDFs can be previewed. Linked requirement completion changes when an approved document is linked and validated. Seeded historical requirements are illustrative.
- A separate chart of accounts for each client, two account templates, accounting year and period display, balanced journal lines, review/return/post workflow, linked vouchers of types JV, CV, CR, and CD, General Ledger, Trial Balance, Income Statement, Balance Sheet, and Accounts Ledger. Financial reports include **posted** journal lines only.
- Compliance records and follow-ups, calculated client submission deadlines, per-record overrides with reasons, live overdue calculations, invoice items, partial payments, outstanding balances, printable invoice and voucher pages, articles, notices, notifications, activity, audit records, workspace settings and CSV exports.
- Search, filtering, sorting, pagination, confirmation dialogs, toasts, responsive navigation, and Reset Demo Data.

The demo uses integer cent amounts for money. Trial Balance and Balance Sheet totals derive from the same posted lines. Journals must balance before submission; a different Owner or Office Manager reviews them; posted entries are immutable. Issued invoices are locked, and a payment cannot exceed the outstanding balance. Bookkeepers see assigned clients and related records, can prepare their own journals and drafts, and cannot perform final document validation or publish articles.

The client submission deadline defaults to 10 calendar days before filing, matching the reference project's prototype assumption in `config/compliance.php`. A record can use an earlier or later date with an override reason. This default is still pending RBCIA policy confirmation in the reference project.

## Simulated and unavailable operations

| Operation | Demo behavior |
|---|---|
| Login, role restrictions, persistence | Simulated locally; never use as real security. |
| Document upload, preview, download | Browser-only. Files up to 2 MB are stored in localStorage; text, images, and PDFs can be previewed. Other file types can be downloaded but have no embedded preview. Seeded records contain generated text. |
| Payments, compliance filing, journal posting | Local workflow simulation; no banking, tax filing, or accounting backend is contacted. |
| Print and CSV | Browser print dialog and client-generated CSV. PDF generation depends on the browser's print-to-PDF feature. |
| Notifications and notices | In-app demo records only; no email or SMS. |
| Accounting period creation and closing | Unavailable in the original web interface; displayed as unavailable. |
| Backup and recovery | No web page; the source application handles these through Artisan commands. |
| Account template initialization | Owner-only. Conflicting client account codes stop initialization; previously initialized template items can be recognized by provenance. |

Reset Demo Data in the Owner's Workspace settings restores the original sample dataset and discards browser edits. Reset affects only this demo's localStorage key.

## Verification

Run `node tests/workflows.cjs` for dependency-free logic and rendering checks. The frontend itself does not require Node. `tests/browser-audit.html`, `tests/browser-onboarding.html`, and `tests/browser-accounting-billing.html` run actual browser role and workflow checks; `tests/browser-smoke.html` and `tests/mobile-smoke.html` are visual check pages, with a 390 px signed-in dashboard frame. See [TEST_REPORT.md](TEST_REPORT.md), [USE_CASE_AUDIT.md](USE_CASE_AUDIT.md), [WORKFLOW_TEST_RESULTS.md](WORKFLOW_TEST_RESULTS.md), [VISUAL_COMPARISON.md](VISUAL_COMPARISON.md), and [REMAINING_GAPS.md](REMAINING_GAPS.md) for results and limits.

## Source reference

The final fidelity audit used the local Veritas Core source at `C:\Users\alexi\RBCIA\veritas-core`, branch `feature/increment-8`: `public/styles.css`, Blade views, routes, controllers, policies, services, `config/rbac.php`, `config/compliance.php`, and the final use case documentation. The demo follows the navy/gold palette, sidebar order, card/table patterns, and policy-specific role restrictions. Source views and CSS were inspected, but equivalent authenticated source screenshots were unavailable, so pixel-identical rendering is unproven. The Laravel project was not modified.
