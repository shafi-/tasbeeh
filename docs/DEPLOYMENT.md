# Deployment — GitHub Pages

The app deploys to **GitHub Pages** as a static site via the
`.github/workflows/deploy.yml` workflow: push to `main2` (or run it manually
from the Actions tab) → build → test → publish.

The build handles two things GitHub Pages can't do natively:

- **Clean URLs** (`/join/CODE`, `/group/…`): the workflow copies `index.html`
  to `404.html` with a capture script, so any deep link redirects into the app
  and restores its path.
- **Base path**: project sites live at `<user>.github.io/<repo>/`, so the
  workflow computes the Vite `base` automatically. Custom domains use `/`
  (see below).

---

## 1. One-time setup

1. Push this branch to GitHub.
2. In the repo: **Settings → Pages → Build and deployment → Source** →
   select **GitHub Actions**.
3. (Optional, for shared-goal rooms) Add repository secrets under
   **Settings → Secrets and variables → Actions → Secrets**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SHARED_ROOMS_BACKEND` (set to `supabase`; leave unset to default)

   The build still succeeds without them — the Group tab simply shows
   "shared goals aren't set up".
4. Push to `main2`. The site publishes to
   `https://<user>.github.io/<repo>/`.

## 2. Custom domain

1. **DNS** — at your domain provider, add records pointing to GitHub Pages:
   - Apex (`example.com`): `A` records →
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www`: `CNAME` → `<user>.github.io`
   (Wait for DNS to propagate — check with `dig example.com +short`.)
2. **Add `public/CNAME`** containing just your domain, then commit:

   ```
   example.com
   ```

   (Vite copies `public/` into every build, and GitHub Pages requires the
   `CNAME` file to be present in the deployed artifact.)
3. **Repo variable for the base path** — a custom domain serves from the
   root, so the `/repo/` base must become `/`:
   **Settings → Secrets and variables → Actions → Variables** →
   *New repository variable*: name `VITE_BASE`, value `/`.
4. **Repo → Settings → Pages → Custom domain** → enter your domain → Save.
   Once the certificate is issued, tick **Enforce HTTPS**.
5. Push (or re-run the workflow). The site now serves from your domain.

> Changing the domain later? Update `public/CNAME` and the `VITE_BASE`
> variable — nothing else.

## Notes

- Room invite links (`https://yourdomain.com/join/CODE`) work as cold opens —
  the 404 fallback + service-worker `navigateFallback` both route them into
  the app.
- The workflow branch is `main2`; switch the `branches:` filter in
  `deploy.yml` if your default branch changes.
- Bundle size is checked on every build; fonts and the Supabase client stay
  out of the critical path, so Pages' 1 GB site limit and 10 GB/month
  bandwidth are far out of reach for this app.
