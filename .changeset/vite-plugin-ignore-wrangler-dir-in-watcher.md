---
"@cloudflare/vite-plugin": patch
---

Keep the dev server's file watcher out of the `.wrangler` directory

Miniflare persists its state under `.wrangler/state` and `.wrangler/tmp`, both inside the Vite root, and writes there while serving a request. The watcher reported those writes as file changes, so every request ran every plugin's `hotUpdate` hook with nothing edited. Plugins that invalidate a module without inspecting which file changed then invalidate on each request, and on a real app graph that SSR invalidation is expensive: an Astro site measured here went from 9.31s to 0.77s a page with this change and no other.

`.wrangler` was already in `server.fs.deny`, but that governs only what may be served, and the directory was still picked up by the dev server's watcher on Linux and Windows.
