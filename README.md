# ChangeOrbit 🚀

ChangeOrbit is an elegant, zero-dependency **Git Conventional Commit Changelog Generator** and **Premium Interactive Dashboard** (Single Page App) designed for modern developers.

It automatically parses your project's commit history based on the [Conventional Commits specification](https://www.conventionalcommits.org/), compiles the data into a classic `CHANGELOG.md` file, creates a structured `changelog.json` database, and serves a visually stunning interactive dashboard with zero workspace clutter!

---

## 🌟 Key Features

* **Zero-Dependency CLI**: Installs in seconds, written completely in native Node.js with no third-party package dependencies.
* **Conventional Commit Parser**: Categorizes commits dynamically into Features, Bug Fixes, Docs, Refactoring, Performance, and more.
* **Seamless Git Tag Support**: Groups commits chronologically under Git tags, falling back to date blocks.
* **Interactive Dashboard Web Console**: Visualizes commit metrics, contributors list, search bars, category filters, and modal copy buttons.
* **Zero Clutter Web Server**: Starts a built-in static web server and hosts your interactive timeline *without* adding HTML, CSS, or JS files to your codebase.
* **Instant Paste Parser**: A live textbox in the dashboard lets you copy-paste raw terminal logs from **any** other codebase on your computer to visualize them instantly in the browser.
* **Static Export Action**: Export the visual dashboard, styling, and database to any folder (e.g., `./docs`) for instant hosting on GitHub Pages, Netlify, or Vercel.

---

## 📦 Installation

ChangeOrbit can be run directly using `npx` or installed globally via npm:

```bash
# Run instantly without installation
npx changeorbit

# Or install globally
npm install -g changeorbit
```

---

## 🚀 Usage & Commands

### 1. Compile Changelog Files
Run the CLI in the root directory of your Git repository:

```bash
# Generates CHANGELOG.md & changelog.json in the current folder
changeorbit
```

#### CLI Flags:
| Flag | Description | Default |
| --- | --- | --- |
| `-r, --repo <path>` | Path to target Git repository | `.` |
| `-o, --output <path>` | Directory to write CHANGELOG.md and changelog.json | `.` |
| `--repo-url <url>` | Base URL of web git provider (to link commits) | Auto-detected |
| `--strict` | Discard non-conventional commits | `false` |
| `-s, --serve` | Start the local server immediately after parsing | `false` |
| `-v, --verbose` | Enable verbose developer logging | `false` |
| `-h, --help` | Show command instructions | |

---

### 2. Launch the Interactive Dashboard
Run the `serve` command to launch the visual timeline and analytics dashboard on a local port (defaults to `8080`):

```bash
changeorbit serve
```
*If port 8080 is already taken by another application, ChangeOrbit will scan and connect to the next available port automatically.*

---

### 3. Export Dashboard for Deployment (GitHub Pages)
Copy the pre-packaged HTML, CSS, JS dashboard assets along with your local `changelog.json` database into any folder:

```bash
changeorbit export ./docs
```
Now, you can commit the `./docs` directory to your repository, point **GitHub Pages** to host from `./docs`, and enjoy a hosted, interactive release dashboard!

---

## 🔗 Continuous Automation (Git Hooks)

Ensure your documentation is always in sync with your source code by auto-compiling changelogs on every new commit.

1. Open or create a file named `post-commit` inside your target project's `.git/hooks/` directory:
   ```bash
   nano .git/hooks/post-commit
   ```
2. Add the ChangeOrbit execution script:
   ```bash
   #!/bin/sh
   # Auto-compile latest commits to CHANGELOG on commit
   npx changeorbit
   ```
3. Make the hook executable:
   ```bash
   chmod +x .git/hooks/post-commit
   ```

Now, every time you make a commit locally, your markdown changelog and JSON database will update automatically!

---

## 📝 Conventional Commits Reference

To get the most out of ChangeOrbit, format your commits as follows:
```text
<type>(<optional-scope>)<!-breaking-indicator>: <description>
```

### Examples:
* `feat(parser): add commit parser core class` — Adds a feature in the parser scope.
* `fix(main): resolve index out of bounds in entrypoint` — Fixes a bug in the main scope.
* `docs: improve documentation and guidelines` — Standard documentation update.
* `feat(auth)!: replace sessions with JWT auth` — Breaking change in the auth scope (uses `!`).

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/my-new-feature`).
3. Make your changes and commit using Conventional Commits.
4. Run `node bin/cli.js` to compile the changelogs.
5. Submit a Pull Request!
