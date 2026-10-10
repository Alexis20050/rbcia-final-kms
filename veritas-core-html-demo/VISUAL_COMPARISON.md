# Visual comparison

Audited 11 October 2026. Source reference: `C:\Users\alexi\RBCIA\veritas-core` (`feature/increment-8`), especially `public/styles.css` and `resources/views`. Demo reference: `index.html`, `css/style.css`, `css/fidelity.css`, and screenshots in `tests/`. Desktop captures used a roughly 1100 px Chrome viewport; `tests/mobile-final.png` used a 390 px frame. The source application was compared through Blade/CSS inspection; a live signed-in source capture at matching viewport and state was unavailable. Thus the observations below are structural, **not pixel measurements or a 100% similarity claim**.

| Screen / state | Laravel reference | Demo observation | Difference / risk |
|---|---|---|---|
| Login | `auth/login.blade.php` and shared styling | `tests/login-final.png`; split brand/card layout, navy/gold palette, role chooser | Demo-only role chooser and permissive password are clearly labelled |
| Dashboard and sidebar | Dashboard view, layout partials | `tests/dashboard-desktop.png`, `tests/mobile-final.png`; grouped navigation and cards | Data and card contents are fictional; responsive shell is a recreation |
| Client list / profile | Client index/show and onboarding views | `tests/clients-desktop.png`; tables, filters, profile sections, checklist | Some Laravel full-page forms appear as demo modals |
| Documents / validation | Document index/show/validation | Table, detail, validation modal, preview/download | Server evidence, storage, and validation history have no full visual counterpart |
| Requirement templates / monitoring | Template, requirement, missing-document views | `tests/templates-final.png`; template cards, checklist and monitoring | Link/unlink controls and template lifecycle remain less detailed |
| Chart and account templates | Account and template views | Client chart table and template panels | Template version/item screens condensed |
| Journal / vouchers | Ledger, voucher forms/show/print | Entry table, line editor, voucher detail and browser print | Laravel evidence fields and print typography differ; seed records are fictional |
| General Ledger / financial | Ledger and financial report views | Posted-only report tables and totals | Report layout approximated; individual print page breaks unverified |
| Compliance / monitoring | Compliance views | Deadline cards, table, detail and preparation controls | Follow-up fields are present; some source status labels still differ |
| Billing | Invoice views and print/PDF | Items, balance, payments, printable detail | No server PDF template or receipt artifact |
| Knowledge / notices | Article and notice views | Lists, details, draft/publish controls | Rich content/editor formatting simplified |
| Notifications | Notification index/top bar | Own notifications list and popover | Scheduled delivery has no visual counterpart |
| Reports | Report index and CSV | `tests/reports-final.png`; category chips, filters, summary, CSV | Summary and export source conventions only partially reproduced |
| Workspace / users / audit | Owner-only admin views | Forms and tables exposed only to Owner | User reset-password flow missing; audit is simulated |
| Modal / empty / error | Form validation and Laravel error views | Modals, toast errors, scoped “Record unavailable” states | Native browser validation and Laravel field error text differ |
| Mobile | Responsive source styles | `tests/mobile-final.png`; compact sidebar/top bar | Only sampled pages at 390 px; no exhaustive device matrix |

The demo carries the source navy/gold palette, sidebar order, bordered cards, dense tables, form controls, and compact mobile navigation. It uses Unicode symbols in some places where the Laravel views use icons, and browser modals for several operations implemented as full Laravel pages. Fonts can fall back offline. These differences remain visible and should be treated as P2/P3 refinements if exact presentation is required.

The source and demo were not captured side by side in identical authenticated states. No screenshot overlay, image-difference score, or accessibility/device-lab comparison was performed. The screenshots demonstrate that the local HTML opens and renders at sampled sizes; they do not establish pixel equality across every page.
