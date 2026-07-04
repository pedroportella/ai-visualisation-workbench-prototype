# Docs

Use this folder for public-facing prototype documentation, reviewer notes and
claim boundaries.

Public docs should state that the prototype uses synthetic data, is not
connected to TMR systems and is not an official TMR system.

Current docs:

- [AWS release readiness](aws-release-readiness.md): planned short AWS review
  release boundary, local gates, evidence model and teardown posture. This is
  readiness documentation only, not live AWS proof.
- [Principal software developer release orchestration decision](release-orchestration-decision.md):
  why the monorepo uses private backend and frontend pnpm release manifests
  while keeping native package files as source of truth.

Current local evidence commands are documented from the repository root in
`README.md` and `scripts/README.md`.
