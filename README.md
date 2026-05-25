<p align="center">
  <img src="https://raw.githubusercontent.com/Sujoymoulick/ChangeOrbit/main/public/changeorbitlogo.png" alt="ChangeOrbit Logo" width="120" height="120" style="border-radius: 28px; box-shadow: 0 10px 30px rgba(0, 242, 254, 0.25);" />
</p>

<h1 align="center">ChangeOrbit</h1>

<p align="center">
  <strong>Sleek & Robust Zero-Dependency conventional Git Commit Changelog Generator & Interactive Web Dashboard</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/changeorbit">
    <img src="https://img.shields.io/npm/v/changeorbit.svg?style=flat-square&color=00F2FE" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.com/package/changeorbit">
    <img src="https://img.shields.io/npm/dm/changeorbit.svg?style=flat-square&color=9D4EE7" alt="NPM Downloads" />
  </a>
  <a href="https://github.com/Sujoymoulick/ChangeOrbit/stargazers">
    <img src="https://img.shields.io/github/stars/Sujoymoulick/ChangeOrbit.svg?style=flat-square&color=F59E0B" alt="GitHub Stars" />
  </a>
  <a href="https://github.com/Sujoymoulick/ChangeOrbit/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Sujoymoulick/ChangeOrbit.svg?style=flat-square&color=10B981" alt="License" />
  </a>
</p>

---

**ChangeOrbit** is a premium developer tool designed to orbit your repository commit history. It parses Git Conventional Commit logs, compiles structured data, automatically updates standard markdown changelogs, and serves a visually stunning interactive timeline dashboard in your default browser—all with **zero workspace clutter** and **zero NPM dependencies**!

---

## 🌟 Key Features

* 🚀 **Zero-Dependency CLI Core**: Built entirely in pure, native Node.js. Installs instantly and runs globally with no third-party package overhead.
* 📝 **Conventional Commit Parser**: Auto-categorizes commit types (`feat`, `fix`, `docs`, `refactor`, `perf`, `chore`, etc.) with strict validation mode.
* 🏷️ **Git Tag Resolution**: Groups commits chronologically under active Git release tags, falling back seamlessly to time-based groups.
* 🌐 **Interactive Dashboard & Search**: Features full-viewport responsive timelines, multi-contributor avatars, search indexing, category filters, and markdown copy shortcuts.
* 🔐 **Seamless GitHub Profile Sync**: Real-time integration with the GitHub API to securely synchronize user names, emails, bios, and active avatar icons on timeline entries.
* 🔄 **Dynamic Port-Collision safety**: Launches the local authentication and dashboard server on port `9099` (auto-incrementing to `9100+` on address clashes) and automatically redirects the browser.
* 📂 **Standalone Exporter**: Compiles and bundles all **7 visual design assets** (HTML/CSS/JS/Logo) alongside your parsed JSON database to instantly host on GitHub Pages, Netlify, or Vercel.

---

## 📦 Installation & Quick Start

ChangeOrbit works as a global CLI or can be run on the fly via `npx` in any project folder:

```bash
# Run instantly without installing
npx changeorbit serve

# Or install globally on your machine
npm install -g changeorbit
```

---

## 🛠️ CLI Reference & Subcommands

Run `changeorbit` inside the root of any repository to start compiling logs:

```bash
changeorbit [options]
```

### 1. Available Subcommands

| Command | Description |
| --- | --- |
| `changeorbit serve [options]` | Generates commit databases and boots the local dashboard HTTP web server. |
| `changeorbit export <dir>` | Copies all 7 pre-packaged dashboard visual files and database to `<dir>` for CDNs. |
| `changeorbit status` | Displays active local GitHub profile credentials and token setup status. |
| `changeorbit logout` | Safely purges cached GitHub session credentials and tokens. |

### 2. Global CLI Options

You can pass these options to customize the output or point to other repositories:

```text
Options:
  -r, --repo <path>       Path to Git repository (default: ".")
  -o, --output <path>     Directory to write CHANGELOG.md & changelog.json (default: ".")
  --repo-url <url>        Base URL of web Git provider (to link commits)
  --strict                Strict mode (ignores non-conventional commits)
  -s, --serve             Start dashboard server immediately after generation
  -v, --verbose           Print detailed debug logs
  -h, --help              Show help information
```

### 3. Verification Examples

```bash
# Compile conventional logs in strict mode
changeorbit --strict

# Compile logs for a different folder and override the remote origin URL
changeorbit --repo ../my-other-project --repo-url https://github.com/user/project

# Bundle the premium dashboard for GitHub Pages
changeorbit export ./docs
```

---

## 🔗 Automation: Auto-Compile on Every Commit

You can keep your timeline database and markdown changelog perfectly synced with your code by adding a simple Git post-commit hook.

1. Create a `post-commit` script inside your project's `.git/hooks/` directory:
   ```bash
   nano .git/hooks/post-commit
   ```
2. Insert the execution shell script:
   ```bash
   #!/bin/sh
   # Automatically compile conventional commits on commit
   changeorbit
   ```
3. Mark the hook file as executable:
   ```bash
   chmod +x .git/hooks/post-commit
   ```

Now, every time you commit locally, ChangeOrbit compiles the newest timeline entries in the background!

---

## 📝 Commit Formatting Guide

ChangeOrbit leverages the standard **Conventional Commits** format. Structure your commit messages like this:

```text
<type>(<optional-scope>)<!-breaking-indicator>: <description>
```

### Standard Types Map:
* `feat`: A new feature (e.g. `feat(parser): add conventional check`)
* `fix`: A bug fix (e.g. `fix(timeline): resolve vertical alignment`)
* `docs`: Documentation updates (e.g. `docs: update setup commands`)
* `perf`: Performance optimizations (e.g. `perf(render): speed up canvas`)
* `refactor`: Refactoring changes (e.g. `refactor(server): wrap port callbacks`)

*Note: Add a `!` after the scope to mark it as a **breaking change** (e.g., `feat(auth)!: switch to token-based headers`).*

---

## 🤝 Contributing & Local Development

1. Fork the repository on GitHub.
2. Link your local build globally to test edits anywhere on your Mac:
   ```bash
   # Run inside the project root directory
   npm link
   ```
3. Create your custom feature branch (`git checkout -b feat/premium-effects`).
4. Commit your changes using Conventional Commit messages.
5. Verify changes locally by typing `changeorbit --help` in any repository, and submit a Pull Request!

---

## ☕ Buy Me a Coffee

If **ChangeOrbit** helped visualize your codebase timelines, speed up your release planning, or added aesthetic value to your developer workflow, consider supporting my work!

<p align="left">
  <a href="https://paypal.me/SujoyMoulick?locale.x=en_GB&country.x=IN" target="_blank">
    <img src="https://img.shields.io/badge/Donate-PayPal-blue.svg?style=for-the-badge&logo=paypal&logoColor=white&color=003087" alt="Donate with PayPal" />
  </a>
</p>

Your generous contributions help keep this zero-dependency project actively maintained and updated with new premium UI layouts. Thank you so much for your support! ❤️

---

*Created with ❤️ by [Sujoy Moulick](https://github.com/Sujoymoulick) & [superstarryeyes](https://github.com/superstarryeyes). Licensed under the MIT License.*
