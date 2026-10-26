// Сборка Triubox (форк BeepBox 4.2.2) через esbuild.
// Воспроизводит схему оригинальной сборки:
//   beepbox_editor.js / .min.js        — редактор (глобал beepbox)
//   beepbox_synth.js / .min.js         — синтезатор отдельно
//   player/beepbox_player.js / .min.js — плеер для iframe
//   beepbox_offline.html               — index.html с инлайн-скриптом
// Результат работает в браузере без сервера (file://).

import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const BANNER = `/*! Triubox v4.2.2 | fork of BeepBox v4.2.2 by John Nesky (https://beepbox.co) | MIT license */`;

/** @param {string} entry @param {string} outfile */
async function bundle(entry, outfile) {
	const common = {
		entryPoints: [path.join(root, entry)],
		bundle: true,
		format: "iife",
		globalName: "beepbox",
		target: ["es2018"],
		sourcemap: true,
		banner: { js: BANNER },
		absWorkingDir: root,
		logLevel: "warning",
	};
	await esbuild.build({ ...common, outfile });
	await esbuild.build({
		...common,
		outfile: outfile.replace(/\.js$/, ".min.js"),
		minify: true,
	});
	console.log("собрано:", outfile, "+", outfile.replace(/\.js$/, ".min.js"));
}

/** Генерация beepbox_offline.html: инлайн минифицированного редактора в index.html. */
function buildOffline() {
	const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
	const minified = fs
		.readFileSync(path.join(root, "beepbox_editor.min.js"), "utf8")
		.replace(/\/\/# sourceMappingURL=.*\n?/, "");

	const marker = '<script type="text/javascript">';
	const lastScriptStart = indexHtml.lastIndexOf(marker);
	if (lastScriptStart < 0) throw new Error("loader script not found in index.html");
	const scriptEnd = indexHtml.indexOf("</script>", lastScriptStart);
	if (scriptEnd < 0) throw new Error("closing script tag not found");
	const afterScript = indexHtml.indexOf("</script>", scriptEnd) + "</script>".length;

	let offline =
		indexHtml.slice(0, lastScriptStart) +
		'<script type="text/javascript">\n\n' +
		minified +
		'\nconst editor = new beepbox.SongEditor(document.getElementById("beepboxEditorContainer"));\n\n\t</script>' +
		indexHtml.slice(afterScript);

	offline = offline.replace(/(<h1>\s*)Triubox(\s*<\/h1>)/, "$1Triubox Offline$2");
	offline = offline.replace(
		"Triubox is an online tool for sketching and sharing instrumental music.",
		"Triubox is an online (and offline!) tool for sketching and sharing instrumental music.",
	);

	fs.writeFileSync(path.join(root, "beepbox_offline.html"), offline);
	console.log("собрано: beepbox_offline.html");
}

await bundle("build/editor-main.ts", "beepbox_editor.js");
await bundle("build/synth-main.ts", "beepbox_synth.js");
await bundle("build/player-main.ts", "player/beepbox_player.js");
buildOffline();
console.log("Готово.");
