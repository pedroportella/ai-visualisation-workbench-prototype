# DigitalOcean Review Deployment

DigitalOcean App Platform can host a short-lived public review environment for
the AI Visualisation Workbench. This is temporary review infrastructure, not
an official TMR environment or a production hosting claim.

## Review Boundary

The App Platform specification deploys two services in one app:

- the Next.js Evidence Workbench is the only public service;
- the FastAPI deterministic fixture backend is reachable only through
  DigitalOcean's private service network;
- the server-side `AIVIS_BACKEND_ORIGIN` value binds to the backend private URL
  and is not exposed through a `NEXT_PUBLIC_*` variable;
- no database, production retrieval, production AI provider, SSO or
  source-system writeback is attached;
- all operational events, source records, warnings and review actions remain
  synthetic.

The backend review action uses process-local state. Restarting or redeploying
the backend restores the initial fixture state.

## Current Review Link

[Open the AI Visualisation Workbench review demo](https://aivis-evidence-workbench-review-qbd9o.ondigitalocean.app/)

The URL is temporary and should be removed after the hiring review period.

## Deploy

The App Platform specification is
[`.do/app.template.yml`](../.do/app.template.yml). It builds the public `main`
branch with the repository's existing backend and frontend Dockerfiles. Push
the intended public commit before creating or rebuilding the app.

Validate and create the app:

```bash
doctl apps spec validate .do/app.template.yml
doctl apps create \
  --spec .do/app.template.yml \
  --format ID,DefaultIngress,ActiveDeployment.ID,Created
```

The template uses public Git clone sources and does not automatically deploy
new pushes. Refresh the review build explicitly after pushing an intended
public commit:

```bash
doctl apps create-deployment <app-id> --force-rebuild
```

## Verify

Wait for the deployment to become active, then run:

```bash
doctl apps get <app-id>
curl -fsS https://<app-host>/ >/dev/null
curl -fsS https://<app-host>/evidence-workbench >/dev/null
AIVIS_BACKEND_RELEASE_PROOF_BASE_URL=https://<app-host> \
  pnpm test:backend-release-proof
```

The last command checks the public same-origin view model and rendered routes,
and fails if the workbench falls back from the private backend to bundled
fixture data.

The reviewer path is:

1. Open the Evidence Workbench and confirm the data source says
   `Backend fixture`.
2. Review the answer and its selected blocker.
3. Inspect source evidence and the process map.
4. Record the deterministic `Request source update` action.
5. Inspect the resulting local audit state.

## Remove After Review

The app contains two billable service instances and should exist only for the
agreed review period. Confirm the exact app name and ID with `doctl apps list`,
then remove it after the review:

```bash
doctl apps delete <app-id>
```

Deletion is irreversible. Re-run `doctl apps list` after deletion to confirm
that the review app no longer exists.
