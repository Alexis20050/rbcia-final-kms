# Remaining gaps and limitations

As of 11 October 2026, the central role, assignment, posting, onboarding, and payment integrity errors found in this audit have been corrected in the demo. These are the remaining differences from the inspected Laravel branch, ordered by practical impact.

| Priority | Gap | Effect / next step |
|---|---|---|
| P1 | Remaining browser click coverage for filtered CSV download, print pages, and every report date combination | Client onboarding, all four voucher create/edit forms, journal review/post, General Ledger and billing pass end-to-end Chrome checks. Add the remaining paths before claiming every interaction is covered. |
| P1 | Password reset and user-admin reset are absent | Profile edit and simulated login work; Laravel reset token/email workflow cannot run without a backend. Label any future mock flow clearly. |
| P1 | Ledger evidence attachments and voucher print detail are simplified | Source records and printable forms contain more evidence/metadata. Extend local evidence fields and print views when those use cases are demonstrated. |
| P2 | Requirement unlink/toggle/delete and account-template version/item lifecycle are incomplete | Current management covers primary create/edit/link/apply paths but not every Laravel action. |
| P2 | Compliance filing and preparation omit some source fields/statuses | Filed date/reference display is present; align remaining source status names, assignment rules, and transition validation. Scheduler delivery stays outside browser scope. |
| P2 | Seeded historical onboarding statuses and requirements are illustrative | Previously onboarded clients may have incomplete present-day seeded checklists; explain history or reconcile fixtures before a formal walkthrough. |
| P2 | Live production posting grant is unknown | Source seeder marks `bookkeeping.post` provisional outside local/testing. Check the installation's effective grants before claiming Owner/Manager can post there. |
| P2 | Visual parity is based on source code and sampled demo screenshots | Obtain source screenshots in identical roles, data states and viewport sizes for pixel-level comparison. Unicode icons, modal/full-page forms, font fallback and print styling differ. |
| P3 | Local browser storage and simulated login are not production security | State is per browser; quota or manual storage edits can change records. Never use real client data. |

Accounting years/periods are **read-only context** in the Laravel web UI. The demo exposes no create/close/reopen action. Backup/restore is handled by Laravel operator commands and has no web page in either UI. Browser notifications are local records and are not claims of email, SMS, or scheduler delivery. Browser print may offer PDF output, but it is not the Laravel PDF endpoint.
