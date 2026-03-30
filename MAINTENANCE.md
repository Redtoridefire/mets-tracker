# Maintenance Notes

## Dependency updates

This project already runs on a modern toolchain (`node@22`, `npm@11`, Vite 5).

To keep dependencies current:

- Check available updates:
  - `npm run deps:check`
- Apply non-breaking updates allowed by semver ranges:
  - `npm run deps:update`
- Rebuild and test:
  - `npm run build`
  - `npm test`

For major upgrades (React/Vite plugin majors), upgrade in a dedicated PR and re-run smoke testing.

## About the `http-proxy` npm warning

If you see:

`npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.`

that warning is caused by an environment variable named `npm_config_http_proxy` (or equivalent) using a legacy key.

Use the modern key instead:

- Preferred: `npm_config_proxy`
- Optional for TLS: `npm_config_https_proxy`

In CI/shell profiles, rename/remove the legacy `http-proxy` npm config env var to eliminate the warning.
