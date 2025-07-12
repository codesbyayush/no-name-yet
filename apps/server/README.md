# my-better-t-app Server

## Local Workers Development

This project is configured to run as a Cloudflare Worker using Wrangler.

### Prerequisites

- [Bun](https://bun.sh/) installed
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) (already installed as a dev dependency)

### Running Locally

To start the server in a local Cloudflare Workers environment:

```sh
bun run wrangler:dev
```

This will use your `wrangler.toml` configuration and serve the Worker locally. By default, it will be available at `http://localhost:8787`.

### Deploying to Cloudflare

To deploy your Worker to Cloudflare:

```sh
bun run wrangler:deploy
```

After deployment, your Worker will be available at:

```
https://my-better-t-app-server.codesbyayush.workers.dev
```

### Environment Variables

- Most environment variables are set in `wrangler.toml` under `[vars]`.
- Secrets (like `DATABASE_URL`) should be set using Wrangler:
  ```sh
  wrangler secret put DATABASE_URL
  ```

### Useful Scripts

- `bun run wrangler:dev` — Start local Workers dev server
- `bun run wrangler:deploy` — Deploy to Cloudflare

---

For more, see the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/).
