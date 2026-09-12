/**
 * Cloudflare Turnstile CAPTCHA support for anonymous sign-in.
 *
 * Supabase's captcha protection guards the signup endpoint — which is
 * exactly what `signInAnonymously()` uses — so once captcha is enabled on
 * the project, every sign-in needs a fresh one-time token from the client.
 *
 * The SITE key is public and ships in the bundle (VITE_TURNSTILE_SITE_KEY);
 * the SECRET key belongs in the Supabase dashboard, never in the app.
 * When the env var is absent this module is inert and sign-in proceeds
 * without a token (a project with captcha disabled ignores tokens anyway).
 *
 * The widget renders `interaction-only` in a corner container: invisible
 * unless Turnstile decides it needs a human check. Tokens are single-use,
 * so each request resets the widget and waits for a fresh callback.
 */

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const TOKEN_TIMEOUT_MS = 60_000;

interface TurnstileApi {
  render(el: HTMLElement, params: Record<string, unknown>): string;
  reset(id?: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptLoaded: Promise<void> | null = null;
let widgetId: string | null = null;
let widgetHost: HTMLElement | null = null;
let tokenResolver: ((token: string) => void) | null = null;
let errorRejector: ((err: Error) => void) | null = null;

export function isCaptchaEnabled(): boolean {
  return Boolean(SITE_KEY);
}

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptLoaded) return scriptLoaded;

  scriptLoaded = new Promise<void>((resolve, reject) => {
    const el = document.createElement('script');
    el.src = SCRIPT_SRC;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      scriptLoaded = null;
      reject(new Error('failed to load turnstile script'));
    };
    document.head.appendChild(el);
  });
  return scriptLoaded;
}

function ensureWidget(): string {
  if (widgetId !== null) return widgetId;

  const host = document.createElement('div');
  // Visible enough for Turnstile to run, tucked into the corner so the
  // rare interactive challenge doesn't disrupt the UI.
  host.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:40;';
  document.body.appendChild(host);
  widgetHost = host;

  widgetId = window.turnstile!.render(host, {
    sitekey: SITE_KEY,
    // Keeps the widget out of sight unless interaction is required.
    appearance: 'interaction-only',
    action: 'signup',
    callback: (token: string) => {
      const resolve = tokenResolver;
      tokenResolver = null;
      resolve?.(token);
    },
    'error-callback': (code?: unknown) => {
      // A widget error (bad/missing hostname, network…) must FAIL the
      // waiters — sending an empty token would only produce a misleading
      // server-side "captcha token missing" later.
      const reject = errorRejector;
      errorRejector = null;
      const resolve = tokenResolver;
      tokenResolver = null;
      resolve?.('');
      reject?.(new Error(`turnstile challenge failed${code ? ` (${code})` : ''}`));
      return true;
    },
  });
  return widgetId;
}

/** Resolves with a fresh single-use token; rejects on widget error/timeout. */
function freshToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    tokenResolver = resolve;
    errorRejector = reject;
    window.setTimeout(() => {
      if (tokenResolver === resolve) {
        tokenResolver = null;
        errorRejector = null;
        reject(new Error('captcha token timeout'));
      }
    }, TOKEN_TIMEOUT_MS);
    window.turnstile!.reset(widgetId!);
  });
}

/** The token Turnstile auto-solved into its hidden response field, if any. */
function currentResponse(): string {
  return widgetHost?.querySelector<HTMLInputElement>('.cf-turnstile-response')?.value ?? '';
}

function clearResponseField(): void {
  const input = widgetHost?.querySelector<HTMLInputElement>('.cf-turnstile-response');
  if (input) input.value = '';
}

/**
 * One token per call. The widget auto-solves shortly after render — that
 * unused token is returned as-is (and the field cleared, since tokens are
 * single-use). Only when no token is queued do we reset (re-solve) and wait
 * for the fresh callback; resetting an already-solved widget unconditionally
 * was racing the auto-solve and hanging sign-in.
 */
export async function getCaptchaToken(): Promise<string> {
  await loadTurnstileScript();
  ensureWidget();
  const existing = currentResponse();
  if (existing) {
    clearResponseField();
    return existing;
  }
  return freshToken();
}
