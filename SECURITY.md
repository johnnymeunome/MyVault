# Security policy

MyVault is an experimental, pre-release credential manager. It is **not safe for real credentials** and has not received an independent security audit.

## Independent audit status

No commit or release of MyVault has been independently audited. The project has a versioned [audit plan](docs/AUDIT-PLAN.md) and [audit package templates](docs/audit), but their existence is not an audit, certification or security guarantee.

A formal audit is a release gate after the write, recovery and platform-hardening milestones are frozen. Any future audit statement must identify the exact commit, auditor, scope, date, unresolved findings and retest status.

Until an external reviewer is available, milestones receive a documented [maintainer-led, AI-assisted internal security review](docs/INTERNAL-SECURITY-REVIEW.md). Published [review reports](docs/security-reviews) identify their exact commit, evidence, open findings and limitations. These reviews improve engineering assurance but are not independent audits.

## Supported versions

Only the latest commit on `main` receives security fixes. There is currently no production release or supported stable version.

## Report a vulnerability

Use [GitHub private vulnerability reporting](https://github.com/johnnymeunome/MyVault/security/advisories/new). Do not open a public issue for a suspected vulnerability and do not include real credentials, personal vaults, access tokens or private filesystem paths.

Include, when possible:

- the affected commit and platform;
- a minimal reproduction using synthetic data;
- the expected security boundary and observed behavior;
- potential impact and suggested mitigation;
- whether the report may be credited publicly.

The maintainer will acknowledge a report as soon as practical, keep discussion in the private advisory and coordinate disclosure after a fix is available. Response times are best-effort because this is an independent portfolio project.

## Security-sensitive scope

Changes involving cryptography, KDBX parsing or writing, secret persistence, native permissions, filesystem access, clipboard behavior, keychain integration, logs or crash dumps require an architectural decision, threat-model update and focused tests before implementation.

Known product limitations are documented in [`docs/SECURITY-NOTES.md`](docs/SECURITY-NOTES.md) and [`docs/THREAT-MODEL.md`](docs/THREAT-MODEL.md). The absence of a production guarantee is not itself a vulnerability, but unexpected exposure beyond those documented boundaries should be reported.

## Safe research

Use only fixtures and accounts you own or are authorized to test. Do not access other people's data, degrade third-party services, use social engineering or publish sensitive details before coordinated disclosure. Good-faith research that follows these rules is welcome.
