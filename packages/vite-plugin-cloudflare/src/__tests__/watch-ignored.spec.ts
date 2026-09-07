import { fileURLToPath } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import { createServer } from "vite";
import { afterEach, describe, test } from "vitest";
import type { ViteDevServer } from "vite";

const fixturesPath = fileURLToPath(new URL("./fixtures", import.meta.url));

describe("watch options", () => {
	let server: ViteDevServer | undefined;

	afterEach(async () => {
		await server?.close();
		server = undefined;
	});

	// Miniflare writes to `.wrangler` while serving a request. Asserted on the
	// resolved config rather than by writing a file and waiting for the watcher,
	// because the platforms disagree about reporting those writes at all.
	test("the dev server watcher ignores the .wrangler directory", async ({
		expect,
	}) => {
		server = await createServer({
			root: fixturesPath,
			logLevel: "silent",
			plugins: [cloudflare({ inspectorPort: false, persistState: false })],
		});

		expect(server.config.server.watch?.ignored).toContain("**/.wrangler/**");
	});

	test("a user's own watch.ignored entries are kept", async ({ expect }) => {
		server = await createServer({
			root: fixturesPath,
			logLevel: "silent",
			server: { watch: { ignored: ["**/fixtures/**"] } },
			plugins: [cloudflare({ inspectorPort: false, persistState: false })],
		});

		expect(server.config.server.watch?.ignored).toEqual(
			expect.arrayContaining(["**/.wrangler/**", "**/fixtures/**"])
		);
	});
});
