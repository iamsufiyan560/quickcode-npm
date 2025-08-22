import fs from "fs";
import path from "path";
import url from "url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const findProjectRoot = () => {
  let currentDir = process.cwd();

  if (currentDir.includes("node_modules")) {
    const parts = currentDir.split(path.sep);
    const nodeModulesIndex = parts.lastIndexOf("node_modules");
    if (nodeModulesIndex > 0) {
      currentDir = parts.slice(0, nodeModulesIndex).join(path.sep);
    }
  }

  return currentDir;
};

const projectRoot = findProjectRoot();
const hasSrc = fs.existsSync(path.join(projectRoot, "src"));
const basePath = hasSrc ? path.join(projectRoot, "src") : projectRoot;

const libDir = path.join(basePath, "lib");
const utilsPath = path.join(libDir, "utils.ts");

let globalsPath;
if (hasSrc) {
  globalsPath = path.join(basePath, "app", "globals.css");
} else {
  globalsPath = path.join(projectRoot, "app", "globals.css");
}

const themeCode = fs.readFileSync(path.join(__dirname, "theme.css"), "utf-8");

const utilsCode = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;

(() => {
  try {
    console.log("🚀 Setting up QuickCode UI...");

    console.log("🛠️ Ensuring utils.ts...");
    fs.mkdirSync(libDir, { recursive: true });

    if (fs.existsSync(utilsPath)) {
      const existing = fs.readFileSync(utilsPath, "utf-8");

      if (
        existing.includes("function cn(...inputs: ClassValue[]) {") &&
        existing.includes("return twMerge(clsx(inputs));")
      ) {
        console.log("ℹ️ cn function already exists in utils.ts, skipping...");
      } else {
        const updated = utilsCode + "\n\n" + existing;
        fs.writeFileSync(utilsPath, updated, "utf-8");
        console.log("✅ cn function prepended to utils.ts");
      }
    } else {
      fs.writeFileSync(utilsPath, utilsCode, "utf-8");
      console.log("✅ utils.ts created");
    }

    console.log("🎨 Ensuring globals.css...");
    fs.mkdirSync(path.dirname(globalsPath), { recursive: true });

    const globalsContent = `
/* QuickCode Theme */
${themeCode}
`;

    if (fs.existsSync(globalsPath)) {
      fs.renameSync(globalsPath, globalsPath + ".bak");
      console.log("📦 Backup created: globals.css.bak");
    }

    fs.writeFileSync(globalsPath, globalsContent, "utf-8");
    console.log("✅ globals.css created/overwritten");

    console.log("🎉 QuickCode UI setup completed!");
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
})();
