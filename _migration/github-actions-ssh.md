# GitHub Actions deploy SSH — password to key auth

Analysis date: 2026-06-08  
Companion: [`env-check.md`](./env-check.md)

Deploy workflows today use [`appleboy/scp-action`](https://github.com/appleboy/scp-action) and [`appleboy/ssh-action`](https://github.com/appleboy/ssh-action) with `secrets.SSH_PASSWORD` in:

- [`.github/workflows/setup-env.yml`](../.github/workflows/setup-env.yml) — upload generated `.env` and compose files
- [`.github/workflows/services.yml`](../.github/workflows/services.yml) — `docker compose pull`, restart, prune

Password auth works but is weaker than key-based SSH: no per-key revocation, higher brute-force exposure, and passwords tend to rotate less often than deploy keys.

---

## Target state

| Area        | Today                                   | Target                                          |
| ----------- | --------------------------------------- | ----------------------------------------------- |
| Auth        | `SSH_PASSWORD` repo/environment secret  | Ed25519 private key in `SSH_PRIVATE_KEY` secret |
| Host access | Password login enabled on Ionos VM      | Key-only login for deploy user                  |
| Workflows   | `password: ${{ secrets.SSH_PASSWORD }}` | `key: ${{ secrets.SSH_PRIVATE_KEY }}`           |
| Rotation    | Manual password change on host + GitHub | Revoke old public key, add new key pair         |

---

## Server prep (Ionos VM)

1. Create a dedicated deploy user (or reuse `SSH_USERNAME`) with a strong, non-login shell policy if applicable.
2. Generate a key pair locally (do not commit the private key):

   ```bash
   ssh-keygen -t ed25519 -C "github-actions-trassenscout-deploy" -f ./trassenscout-deploy -N ""
   ```

3. Append `trassenscout-deploy.pub` to `~/.ssh/authorized_keys` on the server for the deploy user.
4. Verify key login from a machine that is **not** the CI runner:

   ```bash
   ssh -i ./trassenscout-deploy deploy-user@<SSH_HOST>
   ```

5. Disable password authentication for SSH once key login is confirmed (`PasswordAuthentication no` in `sshd_config`), then reload `sshd`.
6. Keep a break-glass console session open while testing — lockout is easy if `authorized_keys` or `sshd_config` is wrong.

---

## GitHub configuration

Per environment (`staging`, `production`):

1. Add secret `SSH_PRIVATE_KEY` with the full private key PEM (including `-----BEGIN/END-----` lines).
2. Keep existing `SSH_HOST` and `SSH_USERNAME` secrets/vars as-is.
3. Remove `SSH_PASSWORD` only after at least one successful deploy with the key on that environment.

Optional hardening:

- Restrict the deploy key in `authorized_keys` with `from=` to [GitHub Actions IP ranges](https://api.github.com/meta) if the host can enforce source IPs.
- Use separate key pairs per environment so a staging key leak does not affect production.

---

## Workflow changes

In `setup-env.yml` and `services.yml`, replace password fields:

```yaml
# before
password: ${{ secrets.SSH_PASSWORD }}

# after
key: ${{ secrets.SSH_PRIVATE_KEY }}
```

`appleboy/*` actions accept `key` directly; no script changes required.

---

## Verification checklist

- [ ] Key login works manually for staging and production hosts
- [ ] `setup-env` uploads `.env` and compose files successfully
- [ ] `services` completes `docker compose pull` and `up -d`
- [ ] Password auth disabled on host SSH
- [ ] `SSH_PASSWORD` removed from GitHub environments
- [ ] Document break-glass recovery (Ionos console, temporary password re-enable)

---

## Rollback

If deploy breaks after cutover:

1. Re-enable password auth temporarily on the host.
2. Restore `password:` in workflows (or revert the workflow commit).
3. Fix `authorized_keys` permissions (`700` for `~/.ssh`, `600` for `authorized_keys`) — SSH silently rejects keys when permissions are too open.
