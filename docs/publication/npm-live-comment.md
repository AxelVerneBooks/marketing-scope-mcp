**npm update** (replaces the "npm package in progress" line in the original submission): the package is now live on npm — `marketing-scope-mcp` v0.1.0, verified installable and runnable from a clean install via both transports (stdio = `node node_modules/marketing-scope-mcp/dist/index.js`, HTTP = `--http --port 3002`), and registered on the official MCP registry as active (`io.github.AxelVerneBooks/marketing-scope-mcp`). Install is now one command:

```bash
npm install -g marketing-scope-mcp
```

(and the client config block in the README works as written — no build step needed).

Everything else in the original submission is unchanged. Adding a Dockerfile as part of the Glama bug-tracking flow (docker/Dockerfile at `72597fe`) — mirrors the sibling repo's, so Docker-based install testing should also work.
