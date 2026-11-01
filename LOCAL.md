# T3 Code on aristotle (local fork)

This is Joseph's fork of [pingdotgg/t3code](https://github.com/pingdotgg/t3code). It
runs on aristotle as a web UI that drives Claude Code, at
https://t3code.zebra-nessie.ts.net. Stood up 2026-11-01 from upstream `955e2bf` plus
the commits on `main` in this fork.

## Changes from upstream

- Product analytics (PostHog through `ingest.t3.codes`) and relay tracing (Axiom) are
  off unless `T3CODE_TELEMETRY_ENABLED=true`. Upstream turns them on by default.
- No favicon lookups. Upstream asks Google's favicon service, or the linked site,
  for an icon of each link in chat. Only inline `data:` icons render here.
- Browser sessions last 10 years instead of 30 days, so a paired device stays paired.

The web UI is built with no `.env`, so the bundle has no Clerk key, relay URL or
tracing endpoint. T3 Connect and app.t3.codes sign-in are not available.

## Layout

| Path                                    | What                                                       |
| --------------------------------------- | ---------------------------------------------------------- |
| `~/code/t3code`                         | this repo; `origin` is the fork, `upstream` is pingdotgg   |
| `deploy/t3code.service`                 | tracked copy of the systemd user unit                      |
| `~/.config/systemd/user/t3code.service` | the installed unit                                         |
| `~/.local/opt/node-v26.12.1-linux-x64`  | private Node runtime and pnpm; system Node (18) is too old |
| `~/.t3/userdata`                        | state: threads, projects, sessions, secrets. Back this up  |

## How it is wired

- The server listens on `127.0.0.1:3773` only. Caddy (`~/code/caddy`) publishes it as
  the `t3code` tsnet node.
- It runs as `jclark` with `~/code` as its working directory, using the `claude` login
  in `~/.local/bin`. Anyone who can use it can run Claude Code and a shell as `jclark`.
- Auth: each new browser or phone pairs once with a one-time token, then keeps a
  long-lived session. Anyone on the tailnet can load the page, but cannot act without
  pairing.
- The unit sets `T3CODE_TELEMETRY_ENABLED=false`, `OTEL_SDK_DISABLED=true`, and points
  `T3CODE_POSTHOG_HOST` at a dead port as a second guard.

## Pair a device

```bash
export PATH=$HOME/.local/opt/node-v26.12.1-linux-x64/bin:$PATH
node ~/code/t3code/apps/server/dist/bin.mjs pair --label phone
```

Open the printed token as `https://t3code.zebra-nessie.ts.net/pair#token=<TOKEN>`
(the printed URL says 127.0.0.1). The token lasts 5 minutes; `--ttl 1h` extends it.
In the Android app, use **Add environment** with that URL, and turn off
**Settings > About T3 Code > Diagnostics > Send crash reports**.

## Update from upstream

```bash
cd ~/code/t3code
export PATH=$HOME/.local/opt/node-v26.12.1-linux-x64/bin:$PATH
git fetch upstream && git merge upstream/main
pnpm install --frozen-lockfile
./node_modules/.bin/vp run --filter t3 build
systemctl --user restart t3code
git push origin main
```

If upstream bumps `engines.node` in `package.json`, install that Node version under
`~/.local/opt` and update the unit's paths. Do not use `t3 update`: it installs the
upstream release, which has telemetry on.

## Check

```bash
systemctl --user status t3code
journalctl --user -u t3code -n 50
curl -s -m 10 -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3773/
curl -s -m 15 -o /dev/null -w '%{http_code}\n' https://t3code.zebra-nessie.ts.net/
```

## Gotchas

- The git pre-commit hook runs `vp`, which needs Node 26. Commit with the private
  Node on `PATH`.
- The welcome dialog still says "T3 Code collects anonymous usage data". That text is
  static; the server sends nothing.
