declare module "cloudflare:workers" {
  export const env: {
    DB?: unknown;
  };
}

type Fetcher = {
  fetch: typeof fetch;
};

type D1Database = unknown;
