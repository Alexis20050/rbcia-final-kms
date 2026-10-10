# Veritas Core use case audit

Audited 11 October 2026 against `C:\Users\alexi\RBCIA\veritas-core`, branch `feature/increment-8`. Source evidence: `docs/diagrams/veritas-core-use-case.puml`, `docs/FINAL-USE-CASE-DIAGRAM.md`, `routes/web.php`, `config/rbac.php`, policies, controllers, services, and Blade views. Demo evidence: `js/app.js`, `js/data.js`, `tests/workflows.cjs`, and `tests/browser-audit.html`. The diagram has **32 web use cases** and three actors. O = Owner, M = Office Manager, B = Bookkeeper. A check below is subject to active account, assigned client, record state, and policy checks. PASS means the central browser simulation and relevant denial were exercised; PARTIAL means a real Laravel step or complete browser interaction remains unverified or unsimulated.

| Actor | Use case | Laravel implementation | Demo location | Test result | Gap | Required correction |
|---|---|---|---|---|---|---|
| O/M/B | Log in / log out | `AuthController`, guest/auth routes | Login, top bar | PASS | Authentication is local simulation | Label simulation, already done |
| O/M/B | Reset own password / edit profile | `AuthController`, profile and reset routes | Profile, login help | PARTIAL | Reset email/token is absent; demo password is not stored | Keep demo limitation explicit |
| O | Manage users and roles | `UserController`, `UserPolicy` | User Management | PARTIAL | Admin reset-password flow is absent | Add if presentation requires it |
| O | Manage workspace settings | `SettingController` | Workspace | PASS | Stored only in browser | None for demo |
| O | View audit logs | `AuditLogController` | Audit Logs | PARTIAL | Demo records only simulated writes | Label scope |
| O/M/B | Manage clients | `ClientController`, `ClientPolicy`, `Access` | Clients, client profile | PASS | Bookkeeper can edit assigned clients and register only within policy scope | None for central flow |
| O/M | Complete client onboarding | `ClientController`, `OnboardingReadiness` | Onboarding, client checklist | PASS | Historical seed data may predate current checklist | Reconcile seed history if used for formal demonstration |
| O/M | Manage requirements and templates | `RequirementController`, `RequirementTemplateController` | Requirements, Document Templates | PARTIAL | Link/create/apply work; unlink, toggle, delete, and richer template lifecycle are incomplete | Add missing management controls |
| O/M/B | Track document follow-ups | `FollowUpController`, follow-up policies | Requirement detail | PASS | Add/edit/delete worked in Chrome; fields and assignee checked in logic | None for central flow |
| O/M/B | Upload / manage documents | `DocumentController`, `DocumentPolicy` | Documents | PARTIAL | Local file metadata/preview; no server checksum/version/storage | Keep simulated file handling clear |
| O/M | Validate / approve / reject documents | `DocumentController::validateDocument` | Document detail/validation | PASS | Demo decision history is simplified | None for central state flow |
| O/M/B | View chart of accounts | `AccountController` | Chart of Accounts | PASS | Bookkeeper read-only and assigned-client scope | None |
| O/M | Manage client accounts | `AccountController`, `AccountPolicy` | Chart of Accounts | PARTIAL | Account status and full edit lifecycle need browser interaction coverage | Extend click tests |
| O | Manage account templates / initialize CoA | `AccountTemplateController`, `AccountController::initialize` | Account Templates, Chart of Accounts | PARTIAL | Version and item lifecycle is simplified; initialization now aborts on conflicting codes | Expand template lifecycle |
| O/M/B | View accounting years / periods as context | Existing period model/options; no mutation route | Accounting Years & Periods | PASS | Seeded demo periods only | Keep read-only label |
| O/B | Create / edit / submit General Journal | `LedgerController`, `JournalWriter`, `JournalEligibility` | General Journal | PASS | Evidence attachments and full form click test remain | Add evidence handling if needed |
| O/M | Review / approve journal | `LedgerController::transition`, policies | General Journal detail | PASS | Reviewer separation/state/period checked in logic test | Add browser click sequence |
| O/M | Post journal | `LedgerController::post`, `JournalPosting` | General Journal detail | PASS | Demo switch defaults enabled; production grant may differ | Verify live grant before presenting production access |
| O/B | Create / edit JV | `VoucherController`, `VoucherWriter` | Vouchers | PASS | New JV and linked journal created in Chrome; metadata validated | None for central flow |
| O/B | Create / edit CV | Same voucher routes/service | Vouchers | PASS | Check fields, cash direction, creation and edit tested in Chrome | None for central flow |
| O/B | Create / edit CR | Same voucher routes/service | Vouchers | PASS | Cash receipt direction, creation and edit tested in Chrome | None for central flow |
| O/B | Create / edit CD | Same voucher routes/service | Vouchers | PASS | Cash disbursement direction, creation and edit tested in Chrome | None for central flow |
| O/M/B | View General Ledger | `GeneralLedgerController` | General Ledger | PASS | Browser print uses native print | None for demo |
| O/M/B | Generate / print financial reports | `FinancialReportController` | Financial Reports | PARTIAL | Posted-only balances checked; all report/date combinations were not click tested | Extend report browser cases |
| O/M/B | Monitor / manage compliance | `ComplianceController`, `CompliancePolicy` | Compliance, Compliance Monitoring | PARTIAL | Preparation, deadlines, filing simulated; Laravel has richer fields/statuses | Align remaining fields and test all transitions |
| O/M/B | Track compliance follow-ups | `ComplianceController` follow-up routes | Compliance detail | PASS | Add/edit/delete worked in Chrome; eligible assignee checked in logic | None for central flow |
| O/M/B | Manage billing / record payments | `InvoiceController`, `PaymentController` | Billing | PASS | Local-only payments, print-to-PDF equivalent | None for central flow |
| O/M/B | Read / draft knowledge articles | `KnowledgeController`, `KnowledgePolicy` | Knowledge Base | PASS | Bookkeeper own draft and published visibility enforced | None for central flow |
| O/M | Publish knowledge articles | `KnowledgeController` | Knowledge detail | PASS | Publish denial for Bookkeeper tested | None |
| O/M/B | View / mark own notifications read | `NotificationController` | Notifications, top bar | PASS | Scheduler/email delivery is not simulated | Keep in-app wording |
| O/M | Manage notices | `NoticeController` | Notices | PARTIAL | Publish works; archive lifecycle needs fuller testing | Add archive test/control where applicable |
| O/M/B | Generate / export module reports | `ReportController` | Reports | PARTIAL | Filtered rows/CSV and summary simulated; full click/export audit pending | Browser test filter and downloaded CSV |

## Role and scope findings

| Capability | Owner | Office Manager | Bookkeeper | Demo check |
|---|---|---|---|---|
| Client create/edit | Yes | Yes | Assigned-client policy scope | Scoped list, detail, form save |
| Client assignment/onboarding | Yes | Yes | No | Controls and actions guarded |
| Document validate | Yes | Yes | No | Approval denial tested |
| Requirement/template management | Yes | Yes | Follow-ups/view only | Create/edit denied |
| Chart view/manage | View/manage | View/manage | View only | Browser audit confirms read-only chart |
| Account template initialization | Yes | No | No | Owner guard |
| Journal create/submit | Yes | No | Own assigned-client drafts | Manager denial; period/account checks |
| Journal review/post | Eligible independent actor | Eligible independent actor | No | Creator separation and state checks |
| Compliance create/assign/file | Yes | Yes | Preparation only | Filing denial tested |
| Billing payment/cancellation | Payment and cancellation | Payment | Assigned-client payment | Cancellation Owner only |
| Knowledge publication | Yes | Yes | Own draft/read only | Publication denial tested |
| Users/workspace/audit | Yes | No | No | Navigation and action checks |

The source diagram is consistent with the inspected routes and policy grants; **no proposed `.puml` correction is justified**. The demo presents no web controls for accounting-period mutation or backup/restore, matching the source documentation. `bookkeeping.post` is provisional outside local/testing according to the source use case notes; the demo switch represents one permitted installation state, not every production database.
