#!/usr/bin/env node
import fs from "fs";
import path from "path";
import readline from "readline";
import https from "https";
import { execSync } from "child_process";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const cmd = args[0];
const compNames = args.slice(1);

const askYesNo = async (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(/^(y|yes)$/i.test(answer.trim()));
    })
  );
};

const fetchFile = (url) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200)
          return reject(new Error(`❌ Failed to fetch ${url}`));
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });

const hasSrc = fs.existsSync(path.join(process.cwd(), "src"));
const basePath = hasSrc ? path.join(process.cwd(), "src") : process.cwd();
const componentsDir = path.join(basePath, "components/ui");
const hooksDir = path.join(basePath, "hooks");

if (!fs.existsSync(componentsDir))
  fs.mkdirSync(componentsDir, { recursive: true });

const COMPONENT_MAP_URL =
  "https://raw.githubusercontent.com/iamsufiyan560/QuickCode/main/components-map.js";

let components = {};
let HOOK_BASE_URL = "";

(async () => {
  try {
    const localMapPath = path.join(__dirname, "component-map.js");
    const mapCode = await fetchFile(COMPONENT_MAP_URL);
    fs.writeFileSync(localMapPath, mapCode, "utf-8");

    const mapModule = await import(localMapPath);
    components = mapModule.components;
    HOOK_BASE_URL = mapModule.HOOK_BASE_URL;

    const installComponent = async (comp) => {
      const compKey = Object.keys(components).find(
        (key) => key.toLowerCase() === comp.toLowerCase()
      );

      if (!compKey) {
        console.error(`❌ Component "${comp}" not found.`);
        return;
      }

      const {
        url: compUrl,
        deps,
        requires = [],
        hooks = [],
      } = components[compKey];

      for (const req of requires) await installComponent(req);

      for (const hook of hooks) {
        if (!fs.existsSync(hooksDir))
          fs.mkdirSync(hooksDir, { recursive: true });
        const hookFile = hook + ".ts";
        const hookDest = path.join(hooksDir, hookFile);

        if (fs.existsSync(hookDest)) {
          const overwrite = await askYesNo(
            `⚠️ Hook ${hookFile} already exists. Overwrite? (y/N): `
          );
          if (!overwrite) {
            console.log(`⏩ Skipped hook ${hookFile}`);
            continue;
          }
          fs.renameSync(hookDest, hookDest + ".bak");
          console.log(`📦 Backup created: ${hookFile}.bak`);
        }

        const hookUrl = HOOK_BASE_URL + hookFile;
        try {
          const hookCode = await fetchFile(
            hookUrl
              .replace("github.com", "raw.githubusercontent.com")
              .replace("/blob/", "/")
          );
          fs.writeFileSync(hookDest, hookCode, "utf-8");
          console.log(`✅ Installed hook ${hookFile}`);
        } catch (e) {
          console.error(`❌ Failed to fetch hook ${hookFile}: ${e.message}`);
        }
      }

      const relativeDest = comp.split("/").join(path.sep) + ".tsx";
      const destPath = path.join(componentsDir, relativeDest);
      const destDir = path.dirname(destPath);

      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

      if (fs.existsSync(destPath)) {
        const overwrite = await askYesNo(
          `⚠️ Component ${comp} exists. Overwrite? (y/N): `
        );
        if (!overwrite) {
          console.log(`⏩ Skipped ${comp}`);
          return;
        }
        fs.renameSync(destPath, destPath + ".bak");
        console.log(`📦 Backup created: ${comp}.bak`);
      }

      try {
        const code = await fetchFile(
          compUrl
            .replace("github.com", "raw.githubusercontent.com")
            .replace("/blob/", "/")
        );
        fs.writeFileSync(destPath, code, "utf-8");
        console.log(`✅ Installed ${comp} → ${destPath}`);
      } catch (e) {
        console.error(`❌ Failed to fetch component ${comp}: ${e.message}`);
      }

      for (const [dep, version] of Object.entries(deps)) {
        try {
          require.resolve(dep, { paths: [process.cwd()] });
          console.log(`ℹ️ Dependency ${dep} already installed.`);
        } catch {
          console.log(`📦 Installing ${dep}@${version}...`);
          execSync(`npm install ${dep}@${version}`, { stdio: "inherit" });
        }
      }
    };

    if (cmd === "add" && compNames.length) {
      for (const comp of compNames) await installComponent(comp);
      console.log("✨ All requested components/hooks installed.");
    } else {
      console.log(`
Usage:
  npx quickcode-ui add <Component...>

Examples:
  npx quickcode-ui add Button
  npx quickcode-ui add Accordion
  npx quickcode-ui add Chart/LineChart Chart/BarChart
`);
    }
  } catch (err) {
    console.error(`❌ Failed to fetch component map: ${err.message}`);
    process.exit(1);
  }
})();
