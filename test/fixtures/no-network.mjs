/**
 * Preload (`node --import`) that makes any non-loopback network call fail.
 * The integration tests start the server with it so a tool that silently
 * reached out to the internet would surface as a tool error, not a pass.
 */
import net from "node:net";

const LOOPBACK = new Set(["127.0.0.1", "::1", "localhost"]);
const blocked = (host) => new Error(`network disabled in tests: refused connection to ${host}`);

const realConnect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  const opts = typeof args[0] === "object" && args[0] !== null ? args[0] : { port: args[0], host: args[1] };
  if (opts.path === undefined && !LOOPBACK.has(opts.host ?? "localhost")) throw blocked(opts.host);
  return realConnect.apply(this, args);
};

const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  if (!LOOPBACK.has(url.hostname.replace(/^\[|\]$/g, ""))) throw blocked(url.hostname);
  return realFetch(input, init);
};
