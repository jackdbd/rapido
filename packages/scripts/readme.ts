import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  compactEmptyLines,
  image,
  licenseLink,
  link,
  toc,
  transcludeFile,
} from "@thi.ng/transclude";
import { callout } from "./ui-components.js";

export const __filename = fileURLToPath(import.meta.url);
export const REPO_ROOT = path.join(__filename, "..", "..", "..");

const run = async () => {
  const { values } = parseArgs({
    allowPositionals: false,
    options: {
      package: { type: "string", short: "p" }, // unscoped package name
      started_in_year: { type: "string", default: "2024" },
    },
  });
  const project_started_in_year = parseInt(values.started_in_year);
  const unscoped_pkg_name = values.package;
  if (!unscoped_pkg_name) {
    throw new Error("You must provide a package name");
  }
  const current_year = new Date().getFullYear();
  const repo_name = "rapido";
  const packages_root = path.join(REPO_ROOT, "packages");
  const pkg_root = path.join(packages_root, unscoped_pkg_name);

  const pkg = JSON.parse(
    readFileSync(path.resolve(pkg_root, "package.json"), "utf-8")
  );

  const fpath = path.resolve(pkg_root, "tpl.readme.md");
  console.log(`generating README.md for ${pkg.name} from ${fpath}`);

  const [npm_scope, _unscoped_pkg_name] = pkg.name.split("/");
  const github_username = npm_scope.replace("@", "") as string;

  const transcluded = transcludeFile(fpath, {
    user: pkg.author,
    templates: {
      badges: () => {
        // https://shields.io/badges/npm-downloads
        // https://shields.io/badges/npm-downloads-by-package-author

        const npm_package = link(
          image(
            `https://badge.fury.io/js/${npm_scope}%2F${unscoped_pkg_name}.svg`,
            "npm version"
          ),
          `https://badge.fury.io/js/${npm_scope}%2F${unscoped_pkg_name}`
          // `https://www.npmjs.com/package/${npm_scope}/${unscoped_pkg_name}`
        );

        const install_size = link(
          image(
            `https://packagephobia.com/badge?p=${npm_scope}/${unscoped_pkg_name}`,
            "install size"
          ),
          `https://packagephobia.com/result?p=${npm_scope}/${unscoped_pkg_name}`
        );

        const socket = link(
          image(
            `https://socket.dev/api/badge/npm/package/${npm_scope}/${unscoped_pkg_name}`,
            "Socket Badge"
          ),
          `https://socket.dev/npm/package/${npm_scope}/${unscoped_pkg_name}`
        );

        // https://app.codecov.io/gh/jackdbd/undici?flags%5B0%5D=eleventy-plugin-telegram
        const codecov = link(
          image(
            `https://codecov.io/gh/${github_username}/${repo_name}/graph/badge.svg?token=BpFF8tmBYS`,
            "CodeCov badge"
          ),
          `https://app.codecov.io/gh/${github_username}/${repo_name}?flags%5B0%5D=${unscoped_pkg_name}`
        );

        return [npm_package, install_size, codecov, socket].join("\n");
      },

      "pkg.deps": () => {
        const entries = Object.entries(pkg.dependencies);

        const rows = entries.map(
          ([name, version]) =>
            `| ${link(name, `https://www.npmjs.com/package/${name}`)} | \`${version}\` |`
        );
        const table = [
          `| Package | Version |`,
          "|---|---|",
          rows.join("\n"),
        ].join("\n");

        return [`## Dependencies`, "\n\n", table].join("");
      },

      "pkg.description": pkg.description,

      "pkg.installation": () => {
        const lines = [`## Installation`];

        lines.push("\n\n");
        lines.push(`\`\`\`sh`);
        lines.push("\n");
        lines.push(`npm install ${pkg.name}`);
        lines.push("\n");
        lines.push(`\`\`\``);

        return lines.join("");
      },

      "pkg.license": ({ user }) => {
        const copyright =
          current_year > project_started_in_year
            ? `&copy; ${project_started_in_year} - ${current_year}`
            : `&copy; ${current_year}`;

        const lines = [
          `## License`,
          "\n\n",
          `${copyright} ${link(
            user.name,
            "https://www.giacomodebidda.com/"
          )} // ${licenseLink(pkg.license)}`,
        ];
        return lines.join("");
      },

      "pkg.name": pkg.name,

      "pkg.peerDependencies": () => {
        if (pkg.peerDependencies) {
          const entries = Object.entries(pkg.peerDependencies);
          const what =
            entries.length === 1 ? `peer dependency` : `peer dependencies`;

          const rows = entries.map(([name, version]) => {
            const s = (version as any).replaceAll("||", "or");
            return `| \`${name}\` | \`${s}\` |`;
          });

          const table = [
            `| Peer | Version range |`,
            "|---|---|",
            rows.join("\n"),
          ].join("\n");

          const strings = [
            callout({
              // emoji: ':warning:',
              emoji: "⚠️",
              title: `Peer Dependencies`,
              message: `This package defines ${entries.length} ${what}.`,
            }),
            "\n\n",
            table,
          ];
          return strings.join("");
        } else {
          return "";
        }
      },
    },

    post: [toc(), compactEmptyLines],
  });

  const outdoc = "README.md";
  // console.log(`=== ${outdoc} BEGIN ===`)
  //   console.log(transcluded.src);
  // console.log(`=== ${outdoc} END ===`)
  writeFileSync(path.join(pkg_root, outdoc), transcluded.src);
};

run();
