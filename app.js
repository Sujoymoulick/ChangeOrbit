/* ChangeOrbit — Frontend Logic & Interactive Engine */

// Embed the generated changelog as a bulletproof fallback for file:// protocols
const DEFAULT_CHANGELOG_DATA = {
  "repoName": "ChangeOrbit",
  "repoUrl": "",
  "generatedAt": "2026-05-25T21:06:12",
  "stats": {
    "totalCommits": 6,
    "totalContributors": 2,
    "contributors": [
      { "name": "Alice Smith", "email": "alice@example.com", "commits": 4 },
      { "name": "Bob Jones", "email": "bob@example.com", "commits": 2 }
    ],
    "byType": { "other": 1, "fix": 1, "docs": 1, "feat": 2, "chore": 1 }
  },
  "releases": [
    {
      "version": "Unreleased",
      "date": "Present",
      "commits": [
        {
          "hash": "57aec05c38e63d0f41c4e181d61f1385ad9d6828",
          "shortHash": "57aec05",
          "author": "Alice Smith",
          "email": "alice@example.com",
          "date": "2026-05-25T21:05:51+05:30",
          "rawSubject": "just some internal cleanup without conventional prefix",
          "type": "other",
          "scope": null,
          "isBreaking": false,
          "description": "just some internal cleanup without conventional prefix",
          "tag": null
        }
      ]
    },
    {
      "version": "v1.1.0",
      "date": "2026-05-25",
      "commits": [
        {
          "hash": "e87764d1ffbf35de40c70b1344686cfba45bdad5",
          "shortHash": "e87764d",
          "author": "Alice Smith",
          "email": "alice@example.com",
          "date": "2026-05-25T21:05:51+05:30",
          "rawSubject": "fix(main): resolve index out of bounds in entrypoint",
          "type": "fix",
          "scope": "main",
          "isBreaking": false,
          "description": "resolve index out of bounds in entrypoint",
          "tag": "v1.1.0"
        },
        {
          "hash": "52fd138d4f141fd717e6cf44ff781e4f05976782",
          "shortHash": "52fd138",
          "author": "Bob Jones",
          "email": "bob@example.com",
          "date": "2026-05-25T21:05:51+05:30",
          "rawSubject": "docs: improve documentation and guidelines",
          "type": "docs",
          "scope": null,
          "isBreaking": false,
          "description": "improve documentation and guidelines",
          "tag": null
        },
        {
          "hash": "1a32cbceb3206de37acc5f61f8493bb12f2188a2",
          "shortHash": "1a32cbc",
          "author": "Bob Jones",
          "email": "bob@example.com",
          "date": "2026-05-25T21:05:51+05:30",
          "rawSubject": "feat(parser): add commit parser core class",
          "type": "feat",
          "scope": "parser",
          "isBreaking": false,
          "description": "add commit parser core class",
          "tag": null
        }
      ]
    },
    {
      "version": "v1.0.0",
      "date": "2026-05-25",
      "commits": [
        {
          "hash": "7d6194ead893337b6229117c1691705728ef5e58",
          "shortHash": "7d6194e",
          "author": "Alice Smith",
          "email": "alice@example.com",
          "date": "2026-05-25T21:05:51+05:30",
          "rawSubject": "feat: add main script entrypoint",
          "type": "feat",
          "scope": null,
          "isBreaking": false,
          "description": "add main script entrypoint",
          "tag": "v1.0.0"
        },
        {
          "hash": "2240caa28f75926fda1b41e7ea5e9d8e804b18f2",
          "shortHash": "2240caa",
          "author": "Alice Smith",
          "email": "alice@example.com",
          "date": "2026-05-25T21:05:47+05:30",
          "rawSubject": "chore: initial commit",
          "type": "chore",
          "scope": null,
          "isBreaking": false,
          "description": "initial commit",
          "tag": null
        }
      ]
    }
  ]
};

// Categories meta configurations
const CATEGORY_META = {
  'feat': { title: 'Features 🚀', color: '#10B981' },
  'fix': { title: 'Bug Fixes 🐛', color: '#EF4444' },
  'docs': { title: 'Documentation 📝', color: '#0EA5E9' },
  'chore': { title: 'Maintenance & Chore 🧹', color: '#F59E0B' },
  'refactor': { title: 'Refactoring 🛠️', color: '#8B5CF6' },
  'perf': { title: 'Performance ⚡', color: '#EC4899' },
  'other': { title: 'Other Changes 📝', color: '#6B7280' }
};

// Conventional Commit Parsing Regex
const CONVENTIONAL_REGEX = /^(\w+)(?:\(([^)]+)\))?(!)?:\s+(.*)$/;
const TAG_REGEX = /tag:\s*([^,\)]+)/;

// Core Application State
let changelogData = null;
let activeFilters = new Set(); // Empty means all categories
let searchQuery = "";
let selectedCommit = null;
let userSession = null; // Active GitHub Session
let isFetchingLive = false; // Sync Lock


// DOM Elements
const repoTitle = document.getElementById("repo-title");
const generatedTimestamp = document.getElementById("generated-timestamp");
const statCommits = document.getElementById("stat-commits");
const statContributors = document.getElementById("stat-contributors");
const statFeatures = document.getElementById("stat-features");
const statFixes = document.getElementById("stat-fixes");
const contributorsList = document.getElementById("contributors-list");
const typeFiltersContainer = document.getElementById("type-filters");
const searchInput = document.getElementById("search-input");
const clearSearchBtn = document.getElementById("clear-search");
const timelineContainer = document.getElementById("timeline");
const noResultsPanel = document.getElementById("no-results");
const themeToggle = document.getElementById("theme-toggle");
const repoLink = document.getElementById("repo-link");

// Modal Elements
const commitModal = document.getElementById("commit-modal");
const modalTypeBadge = document.getElementById("modal-commit-type-badge");
const modalSubject = document.getElementById("modal-commit-subject");
const modalHash = document.getElementById("modal-commit-hash");
const modalAuthor = document.getElementById("modal-commit-author");
const modalDate = document.getElementById("modal-commit-date");
const modalScopeRow = document.getElementById("modal-scope-row");
const modalScope = document.getElementById("modal-commit-scope");
const copyHashBtn = document.getElementById("copy-hash-btn");
const copyMarkdownBtn = document.getElementById("copy-markdown-btn");
const closeModalBtn = document.getElementById("close-modal-btn");

// Parser Elements
const rawLogInput = document.getElementById("raw-log-input");
const parseLogBtn = document.getElementById("parse-log-btn");
const resetLogBtn = document.getElementById("reset-log-btn");

/* --- Theme Management --- */
function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
}

themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
});

/* --- Initialization --- */
document.addEventListener("DOMContentLoaded", async () => {
    initTheme();
    setupEventListeners();
    await checkSession(); // Check active GitHub Login
    loadChangelogData();
});

function setupEventListeners() {
    // Search
    searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        clearSearchBtn.style.display = searchQuery ? "block" : "none";
        renderTimeline();
    });

    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        searchQuery = "";
        clearSearchBtn.style.display = "none";
        renderTimeline();
    });

    // Modal Close
    closeModalBtn.addEventListener("click", hideModal);
    commitModal.addEventListener("click", (e) => {
        if (e.target === commitModal) hideModal();
    });

    // Copy Actions
    copyHashBtn.addEventListener("click", () => {
        if (selectedCommit) {
            navigator.clipboard.writeText(selectedCommit.hash);
            showToast(copyHashBtn, "Copied!");
        }
    });

    copyMarkdownBtn.addEventListener("click", () => {
        if (selectedCommit) {
            const scopeStr = selectedCommit.scope ? `**${selectedCommit.scope}**: ` : "";
            const breakingStr = selectedCommit.isBreaking ? "⚠️ **BREAKING CHANGE**: " : "";
            const repoUrl = changelogData.repoUrl;
            let hashLink = `\`${selectedCommit.shortHash}\``;
            if (repoUrl) {
                hashLink = `[${selectedCommit.shortHash}](${repoUrl}/commit/${selectedCommit.hash})`;
            }
            const mdLine = `- ${breakingStr}${scopeStr}${selectedCommit.description} (${hashLink})`;
            navigator.clipboard.writeText(mdLine);
            showToast(copyMarkdownBtn, "Markdown Copied!");
        }
    });

    // Live Parser Actions
    parseLogBtn.addEventListener("click", handleRawLogParse);
    resetLogBtn.addEventListener("click", () => {
        rawLogInput.value = "";
        initializeDashboard(DEFAULT_CHANGELOG_DATA);
    });
}

function showToast(buttonEl, message) {
    const originalHTML = buttonEl.innerHTML;
    buttonEl.innerHTML = `<i data-lucide="check" class="sm-icon"></i> ${message}`;
    lucide.createIcons();
    buttonEl.style.transform = "scale(1.05)";
    buttonEl.style.borderColor = "var(--color-feat)";
    setTimeout(() => {
        buttonEl.innerHTML = originalHTML;
        buttonEl.style.transform = "";
        buttonEl.style.borderColor = "";
        lucide.createIcons();
    }, 2000);
}

/* --- GitHub Profile Session Binders --- */

async function checkSession() {
    try {
        const response = await fetch("/api/user-config");
        if (!response.ok) return;
        
        const config = await response.json();
        
        // Dynamically bind running version badge if present
        if (config && config.version) {
            const versionBadge = document.getElementById("version-badge");
            if (versionBadge) {
                versionBadge.textContent = `v${config.version}`;
            }
        }

        if (config && config.user) {
            userSession = {
                ...config.user,
                githubToken: config.githubToken || ""
            };
            
            // Set Header session visual badge
            const badge = document.getElementById("user-profile-badge");
            const avatar = document.getElementById("user-avatar");
            const nameEl = document.getElementById("user-display-name");
            const handleEl = document.getElementById("user-github-handle");
            const logoutBtn = document.getElementById("logout-btn");
            
            if (badge && avatar && nameEl && handleEl) {
                avatar.src = userSession.avatar_url;
                nameEl.textContent = userSession.name;
                handleEl.textContent = `@${userSession.login}`;
                badge.style.display = "flex";
                
                logoutBtn.addEventListener("click", handleLogout);
            }
        }
    } catch (e) {
        console.warn("Could not query user config from server. Using local dashboard mode.", e);
    }
}

async function handleLogout() {
    try {
        const response = await fetch("/api/logout", { method: "POST" });
        if (response.ok) {
            window.location.reload();
        }
    } catch (e) {
        console.error("Logout failed:", e);
    }
}

/* --- Data Loading --- */
async function loadChangelogData() {
    try {
        const response = await fetch("changelog.json");
        if (!response.ok) throw new Error("File not found");
        const data = await response.json();
        initializeDashboard(data);
    } catch (err) {
        console.warn("Could not fetch changelog.json directly. Falling back to embedded local data...", err);
        initializeDashboard(DEFAULT_CHANGELOG_DATA);
        
        // Render repository connection failure alert dynamically
        showRepoConnectionAlert();
    }
}

function showRepoConnectionAlert() {
    const sidebar = document.querySelector(".sidebar-panel");
    if (!sidebar) return;
    
    if (document.getElementById("repo-connection-alert")) return;
    
    const alert = document.createElement("div");
    alert.id = "repo-connection-alert";
    alert.className = "glass-card";
    alert.style.background = "rgba(239, 68, 68, 0.08)";
    alert.style.borderColor = "rgba(239, 68, 68, 0.25)";
    alert.style.padding = "18px";
    alert.style.borderRadius = "14px";
    alert.style.display = "flex";
    alert.style.gap = "14px";
    alert.style.marginBottom = "24px";
    alert.style.boxShadow = "0 10px 30px rgba(239, 68, 68, 0.1)";
    alert.style.animation = "scaleIn 0.3s ease forwards";
    
    alert.innerHTML = `
        <i data-lucide="alert-triangle" style="color: #EF4444; flex-shrink: 0; width: 22px; height: 22px; margin-top: 2px;"></i>
        <div style="text-align: left;">
            <h4 style="color: #FFF; font-size: 0.95rem; font-weight: 700; margin-bottom: 6px;">Git Repository Disconnected</h4>
            <p style="color: var(--text-secondary); font-size: 0.8rem; line-height: 1.45; margin-bottom: 10px;">
                The current terminal directory <code>.</code> is not connected to a Git repository. Showing ChangeOrbit demo logs as a preview.
            </p>
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; background: rgba(0,0,0,0.25); padding: 8px 12px; border-radius: 6px; color: #EF4444; border: 1px solid rgba(239, 68, 68, 0.15);">
                $ git init && git add . && git commit -m "feat: init"
            </div>
        </div>
    `;
    
    sidebar.insertBefore(alert, sidebar.firstChild);
    lucide.createIcons();
}

function initializeDashboard(data) {
    changelogData = data;
    
    // Set Header/Repo Info
    repoTitle.textContent = data.repoName;
    const formattedDate = new Date(data.generatedAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
    generatedTimestamp.textContent = `Generated: ${formattedDate}`;
    
    // Setup Repository link
    if (data.repoUrl) {
        repoLink.href = data.repoUrl;
        repoLink.style.display = "inline-flex";
    } else {
        repoLink.style.display = "none";
    }
    
    // Calculate & render stats
    renderStats(data);
    
    // Render Contributors list
    renderContributors(data.stats.contributors);
    
    // Render Filter Pills
    renderFilterPills(data);
    
    // Render Timeline
    activeFilters.clear();
    renderTimeline();
    
    // Fetch live GitHub stats if available
    fetchGitHubStats(data);
    
    // Check if we should fetch full real-time repository commits & contributors from GitHub REST API
    if (userSession && data.repoUrl && !data.isLive && !isFetchingLive) {
        triggerLiveGitHubSync(data.repoUrl);
    }
    
    // Refresh Icons
    lucide.createIcons();
}

/* --- View Rendering --- */

function renderStats(data) {
    statCommits.textContent = data.stats.totalCommits;
    statContributors.textContent = data.stats.totalContributors;
    
    const featCount = data.stats.byType['feat'] || 0;
    const fixCount = data.stats.byType['fix'] || 0;
    
    statFeatures.textContent = featCount;
    statFixes.textContent = fixCount;
}

function renderContributors(contributors) {
    contributorsList.innerHTML = "";
    if (!contributors || contributors.length === 0) {
        contributorsList.innerHTML = `<p class="panel-subtitle">No contributors listed</p>`;
        return;
    }
    
    contributors.forEach(c => {
        const initials = c.name ? c.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "??";
        
        // Sync Avatar with Authenticated User details or Live contributor details
        let avatarHTML = `<div class="contributor-avatar">${initials}</div>`;
        if (c.avatar) {
            avatarHTML = `<img class="contributor-avatar" src="${c.avatar}" style="border: 2px solid var(--border-color); object-fit: cover;">`;
        } else if (userSession && (
            c.email === userSession.email || 
            c.name.toLowerCase() === userSession.name.toLowerCase() || 
            c.name.toLowerCase() === userSession.login.toLowerCase()
        )) {
            avatarHTML = `<img class="contributor-avatar" src="${userSession.avatar_url}" style="border: 2px solid var(--primary-accent); object-fit: cover;">`;
        }

        const item = document.createElement("div");
        item.className = "contributor-item";
        item.innerHTML = `
            <div class="contributor-info">
                ${avatarHTML}
                <div class="contributor-name" title="${c.name} (${c.email})">${c.name}</div>
            </div>
            <div class="contributor-count">${c.commits} commits</div>
        `;
        contributorsList.appendChild(item);
    });
}

function renderFilterPills(data) {
    typeFiltersContainer.innerHTML = "";
    
    const typesPresent = Object.keys(data.stats.byType);
    typesPresent.forEach(t => {
        const meta = CATEGORY_META[t] || { title: t, color: '#6B7280' };
        const pill = document.createElement("button");
        pill.className = "filter-pill";
        pill.dataset.type = t;
        pill.innerHTML = `${meta.title} (${data.stats.byType[t]})`;
        
        // CSS custom properties for active styling
        pill.style.setProperty('--accent-color', meta.color);
        pill.style.setProperty('--accent-color-bg', `${meta.color}18`);
        
        pill.addEventListener("click", () => {
            if (activeFilters.has(t)) {
                activeFilters.delete(t);
                pill.classList.remove("active");
            } else {
                activeFilters.add(t);
                pill.classList.add("active");
            }
            renderTimeline();
        });
        
        typeFiltersContainer.appendChild(pill);
    });
}

function renderTimeline() {
    timelineContainer.innerHTML = "";
    let matchCount = 0;
    
    changelogData.releases.forEach(release => {
        // Filter commits inside this release
        const filteredCommits = release.commits.filter(commit => {
            // Category filter
            if (activeFilters.size > 0 && !activeFilters.has(commit.type)) {
                return false;
            }
            
            // Search query filter
            if (searchQuery) {
                const inDesc = commit.description.toLowerCase().includes(searchQuery);
                const inScope = commit.scope && commit.scope.toLowerCase().includes(searchQuery);
                const inAuthor = commit.author.toLowerCase().includes(searchQuery);
                const inHash = commit.hash.toLowerCase().includes(searchQuery);
                const inSubject = commit.rawSubject && commit.rawSubject.toLowerCase().includes(searchQuery);
                
                if (!inDesc && !inScope && !inAuthor && !inHash && !inSubject) {
                    return false;
                }
            }
            
            return true;
        });
        
        if (filteredCommits.length === 0) return;
        
        matchCount += filteredCommits.length;
        
        // Create Release Group container
        const releaseGroup = document.createElement("div");
        releaseGroup.className = "release-group";
        
        // Header
        const header = document.createElement("div");
        header.className = "release-header";
        
        const dot = document.createElement("div");
        dot.className = "release-dot";
        dot.innerHTML = `<i data-lucide="tag" class="sm-icon" style="width:12px;height:12px;color:var(--primary-accent)"></i>`;
        
        const title = document.createElement("div");
        title.className = "release-title";
        title.innerHTML = `${release.version} <span class="release-date">${release.date}</span>`;
        
        header.appendChild(dot);
        header.appendChild(title);
        releaseGroup.appendChild(header);
        
        // Group commits inside release by category type
        const categorized = {};
        filteredCommits.forEach(c => {
            categorized[c.type] = categorized[c.type] || [];
            categorized[c.type].push(c);
        });
        
        // Sort category keys based on priority
        const sortedTypes = Object.keys(categorized).sort((a, b) => {
            const prioA = a === 'feat' ? 1 : a === 'fix' ? 2 : a === 'perf' ? 3 : a === 'refactor' ? 4 : a === 'docs' ? 5 : 6;
            const prioB = b === 'feat' ? 1 : b === 'fix' ? 2 : b === 'perf' ? 3 : b === 'refactor' ? 4 : b === 'docs' ? 5 : 6;
            return prioA - prioB;
        });
        
        sortedTypes.forEach(t => {
            const block = document.createElement("div");
            block.className = "category-block";
            
            const meta = CATEGORY_META[t] || { title: t, color: '#6B7280' };
            const titleBar = document.createElement("div");
            titleBar.className = "category-title-bar";
            titleBar.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${meta.color}; display: inline-block;"></span> ${meta.title}`;
            
            const list = document.createElement("div");
            list.className = "commit-card-list";
            
            categorized[t].forEach(commit => {
                const card = document.createElement("div");
                card.className = "commit-card";
                card.addEventListener("click", () => showModal(commit));
                
                const shortDate = new Date(commit.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                let scopeBadge = commit.scope ? `<span class="commit-scope">${commit.scope}</span>` : "";
                let breakingWarning = commit.isBreaking ? `
                    <div class="breaking-warning">
                        <i data-lucide="alert-triangle" class="sm-icon"></i> BREAKING CHANGE
                    </div>
                ` : "";
                
                // Show real avatar on commits matching the logged-in user or fetched from GitHub
                let authorAvatar = `<i data-lucide="user" class="sm-icon" style="width: 12px; height: 12px;"></i>`;
                if (commit.avatar) {
                    authorAvatar = `<img src="${commit.avatar}" style="width: 14px; height: 14px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color);">`;
                } else if (userSession && (
                    commit.email === userSession.email || 
                    commit.author.toLowerCase() === userSession.name.toLowerCase() || 
                    commit.author.toLowerCase() === userSession.login.toLowerCase()
                )) {
                    authorAvatar = `<img src="${userSession.avatar_url}" style="width: 14px; height: 14px; border-radius: 50%; object-fit: cover; border: 1px solid var(--primary-accent);">`;
                }

                card.innerHTML = `
                    <div class="commit-card-header">
                        <div class="commit-meta">
                            <span class="commit-badge ${commit.type}">${commit.type}</span>
                            ${scopeBadge}
                        </div>
                        <span class="commit-hash">${commit.shortHash}</span>
                    </div>
                    <div class="commit-card-body">
                        <div class="commit-desc">${commit.description}</div>
                        ${breakingWarning}
                    </div>
                    <div class="commit-card-footer">
                        <span class="commit-author" style="gap: 6px;">
                            ${authorAvatar}
                            ${commit.author}
                        </span>
                        <span>${shortDate}</span>
                    </div>
                `;
                list.appendChild(card);
            });
            
            block.appendChild(titleBar);
            block.appendChild(list);
            releaseGroup.appendChild(block);
        });
        
        timelineContainer.appendChild(releaseGroup);
    });
    
    // Show/hide no-results
    if (matchCount === 0) {
        noResultsPanel.style.display = "flex";
    } else {
        noResultsPanel.style.display = "none";
    }
    
    lucide.createIcons();
}

/* --- Commit Modal --- */
function showModal(commit) {
    selectedCommit = commit;
    
    const meta = CATEGORY_META[commit.type] || { title: commit.type, color: '#6B7280' };
    modalTypeBadge.textContent = meta.title;
    modalTypeBadge.style.color = "#FFF";
    modalTypeBadge.style.backgroundColor = meta.color;
    
    modalSubject.textContent = commit.rawSubject;
    modalHash.textContent = commit.hash;
    modalAuthor.textContent = `${commit.author} <${commit.email}>`;
    modalDate.textContent = new Date(commit.date).toLocaleString();
    
    if (commit.scope) {
        modalScope.textContent = commit.scope;
        modalScopeRow.style.display = "flex";
    } else {
        modalScopeRow.style.display = "none";
    }
    
    commitModal.style.display = "flex";
}

function hideModal() {
    commitModal.style.display = "none";
    selectedCommit = null;
}

/* --- Live Copy-Paste Log Parser --- */
function handleRawLogParse() {
    const rawText = rawLogInput.value.trim();
    if (!rawText) {
        alert("Please paste some git log content first!");
        return;
    }
    
    try {
        const parsedData = parseLogString(rawText);
        if (parsedData.releases.length === 0) {
            throw new Error("No commits parsed. Please check the input format.");
        }
        initializeDashboard(parsedData);
        showToast(parseLogBtn, "Parsed Successfully!");
    } catch (err) {
        alert(`Parsing Failed: ${err.message}\nMake sure your log fits standard formatting.`);
    }
}

function parseLogString(rawText) {
    const lines = rawText.split("\n");
    let commits = [];
    
    // Check if it's the custom Pipe format: Hash|Author|Email|Date|Subject|Decoration
    const pipeMatchCount = (lines[0].match(/\|/g) || []).length;
    
    if (pipeMatchCount >= 4) {
        // Custom Pipe parsing
        lines.forEach(line => {
            if (!line.trim()) return;
            const parts = line.split("|");
            if (parts.length < 5) return;
            
            const hash = parts[0];
            const author = parts[1];
            const email = parts[2];
            const date = parts[3];
            const subject = parts[4];
            const decoration = parts[5] || "";
            
            let tag = null;
            const tagMatch = TAG_REGEX.exec(decoration);
            if (tagMatch) tag = tagMatch[1].trim();
            
            const commitObj = buildCommitObject(hash, author, email, date, subject, tag);
            commits.push(commitObj);
        });
    } else {
        // Standard git log format parser
        let currentCommit = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check for new commit line
            const commitMatch = /^commit\s+([a-f0-9]{7,40})(?:\s+\(([^)]+)\))?/i.exec(line);
            if (commitMatch) {
                if (currentCommit) {
                    commits.push(currentCommit);
                }
                
                const hash = commitMatch[1];
                let tag = null;
                if (commitMatch[2]) {
                    const tagMatch = TAG_REGEX.exec(commitMatch[2]);
                    if (tagMatch) tag = tagMatch[1].trim();
                }
                
                currentCommit = {
                    hash: hash,
                    tag: tag,
                    subjectLines: [],
                    authorName: "Unknown",
                    authorEmail: "unknown@example.com",
                    dateStr: new Date().toISOString()
                };
                continue;
            }
            
            if (!currentCommit) continue;
            
            // Check for Author line
            const authorMatch = /^Author:\s*(.*?)\s*<(.*?)>/i.exec(line);
            if (authorMatch) {
                currentCommit.authorName = authorMatch[1].trim();
                currentCommit.authorEmail = authorMatch[2].trim();
                continue;
            }
            
            // Check for Date line
            const dateMatch = /^Date:\s*(.*)/i.exec(line);
            if (dateMatch) {
                try {
                    currentCommit.dateStr = new Date(dateMatch[1].trim()).toISOString();
                } catch(e) {
                    currentCommit.dateStr = new Date().toISOString();
                }
                continue;
            }
            
            // Indented block lines contain subjects/descriptions
            if (line.startsWith("    ")) {
                const trimmed = line.trim();
                if (trimmed) {
                    currentCommit.subjectLines.push(trimmed);
                }
            }
        }
        
        if (currentCommit) {
            commits.push(currentCommit);
        }
        
        // Convert internal format to compiled objects
        commits = commits.map(c => {
            const subject = c.subjectLines.join(" ") || "No commit message";
            return buildCommitObject(c.hash, c.authorName, c.authorEmail, c.dateStr, subject, c.tag);
        });
    }
    
    // Group into releases
    const releases = [];
    let currentRelease = {
        version: 'Unreleased',
        date: 'Present',
        commits: []
    };
    
    commits.forEach(commit => {
        if (commit.tag) {
            if (currentRelease.commits.length > 0 || currentRelease.version === 'Unreleased') {
                releases.push(currentRelease);
            }
            
            let releaseDate = "Present";
            try {
                releaseDate = commit.date.substring(0, 10);
            } catch(e) {}
            
            currentRelease = {
                version: commit.tag,
                date: releaseDate,
                commits: []
            };
        }
        currentRelease.commits.push(commit);
    });
    
    if (currentRelease.commits.length > 0) {
        releases.push(currentRelease);
    }
    
    if (releases.length > 1 && releases[0].version === 'Unreleased' && releases[0].commits.length === 0) {
        releases.shift();
    }
    
    // Calculate statistics
    const byType = {};
    const authorCounts = {};
    
    commits.forEach(c => {
        byType[c.type] = (byType[c.type] || 0) + 1;
        const key = `${c.author}|${c.email}`;
        authorCounts[key] = (authorCounts[key] || 0) + 1;
    });
    
    const contributors = Object.keys(authorCounts).map(k => {
        const parts = k.split("|");
        return {
            name: parts[0],
            email: parts[1],
            commits: authorCounts[k]
        };
    }).sort((a,b) => b.commits - a.commits);
    
    return {
        repoName: "ChangeOrbit",
        repoUrl: "",
        generatedAt: new Date().toISOString(),
        stats: {
            totalCommits: commits.length,
            totalContributors: contributors.length,
            contributors: contributors,
            byType: byType
        },
        releases: releases
    };
}

function buildCommitObject(hash, author, email, date, subject, tag) {
    const match = CONVENTIONAL_REGEX.exec(subject);
    let type = 'other';
    let scope = null;
    let breaking = false;
    let description = subject;
    
    if (match) {
        type = match[1].toLowerCase();
        scope = match[2] || null;
        breaking = !!match[3];
        description = match[4];
        
        if (!CATEGORY_META[type]) {
            type = 'other';
        }
    }
    
    return {
        hash: hash,
        shortHash: hash.substring(0, 7),
        author: author,
        email: email,
        date: date,
        rawSubject: subject,
        type: type,
        scope: scope,
        isBreaking: breaking,
        description: description,
        tag: tag
    };
}

async function fetchGitHubStats(data) {
    if (!data.repoUrl) return;
    
    // Parse owner/repo
    const match = /github\.com\/([^\/]+)\/([^\/]+)/.exec(data.repoUrl);
    if (!match) return;
    
    const owner = match[1];
    const repo = match[2];
    
    try {
        const headers = {};
        if (userSession && userSession.githubToken) {
            headers["Authorization"] = `Bearer ${userSession.githubToken}`;
        }
        
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        if (!response.ok) return;
        
        const repoData = await response.json();
        
        // Show active stars/forks count in Repo Card
        const repoCard = document.querySelector(".repo-card");
        if (repoCard) {
            let statsBar = document.getElementById("github-repo-stats");
            if (!statsBar) {
                statsBar = document.createElement("div");
                statsBar.id = "github-repo-stats";
                statsBar.className = "github-repo-stats";
                repoCard.appendChild(statsBar);
            }
            
            statsBar.innerHTML = `
                <div class="repo-stat-pill" title="GitHub Stars">
                    <i data-lucide="star" style="width: 12px; height: 12px; color: #F59E0B;"></i>
                    <span>${repoData.stargazers_count}</span>
                </div>
                <div class="repo-stat-pill" title="Forks">
                    <i data-lucide="git-fork" style="width: 12px; height: 12px; color: var(--primary-accent);"></i>
                    <span>${repoData.forks_count}</span>
                </div>
                <div class="repo-stat-pill" title="Open Issues">
                    <i data-lucide="alert-circle" style="width: 12px; height: 12px; color: var(--color-fix);"></i>
                    <span>${repoData.open_issues_count}</span>
                </div>
            `;
            
            // Add description if not set
            if (repoData.description) {
                const subtext = document.getElementById("generated-timestamp");
                let descText = document.getElementById("github-repo-desc");
                if (!descText) {
                    descText = document.createElement("p");
                    descText.id = "github-repo-desc";
                    descText.className = "github-repo-desc";
                    subtext.parentNode.insertBefore(descText, subtext.nextSibling);
                }
                descText.textContent = repoData.description;
            }
            
            lucide.createIcons();
        }
    } catch(e) {
        console.warn("Could not fetch live GitHub stats.", e);
    }
}

async function fetchRealGitHubChangelog(repoUrl) {
    const match = /github\.com\/([^\/]+)\/([^\/]+)/.exec(repoUrl);
    if (!match) return null;
    
    const owner = match[1];
    const repo = match[2];
    
    try {
        const headers = {};
        if (userSession && userSession.githubToken) {
            headers["Authorization"] = `Bearer ${userSession.githubToken}`;
        }
        
        // 1. Fetch Repository Details
        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
        if (!repoRes.ok) return null;
        const repoData = await repoRes.json();
        
        // 2. Fetch Commits (up to 100)
        const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`, { headers });
        if (!commitsRes.ok) return null;
        const githubCommits = await commitsRes.json();
        
        // 3. Fetch Releases/Tags to match versions
        let releasesMap = {};
        try {
            const releasesRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases?per_page=100`, { headers });
            if (releasesRes.ok) {
                const releasesData = await releasesRes.json();
                releasesData.forEach(rel => {
                    releasesMap[rel.target_commitish] = rel.tag_name;
                    releasesMap[rel.tag_name] = rel.tag_name;
                });
            }
        } catch (e) {
            console.warn("Could not fetch repo releases:", e);
        }
        
        // Translate GitHub Commits to ChangeOrbit Commit format
        const parsedCommits = githubCommits.map(item => {
            const rawSubject = item.commit.message.split("\n")[0];
            const match = CONVENTIONAL_REGEX.exec(rawSubject);
            
            let type = 'other';
            let scope = null;
            let breaking = false;
            let description = rawSubject;
            
            if (match) {
                type = match[1].toLowerCase();
                scope = match[2] || null;
                breaking = !!match[3];
                description = match[4];
                
                if (!CATEGORY_META[type]) {
                    type = 'other';
                }
            }
            
            let tag = releasesMap[item.sha] || null;
            
            return {
                hash: item.sha,
                shortHash: item.sha.substring(0, 7),
                author: item.commit.author.name,
                email: item.commit.author.email,
                date: item.commit.author.date,
                rawSubject: rawSubject,
                type: type,
                scope: scope,
                isBreaking: breaking,
                description: description,
                tag: tag,
                avatar: item.author ? item.author.avatar_url : null
            };
        });
        
        // Group commits into releases
        const releases = [];
        let currentRelease = {
            version: 'Unreleased',
            date: 'Present',
            commits: []
        };
        
        parsedCommits.forEach(commit => {
            if (commit.tag) {
                if (currentRelease.commits.length > 0 || currentRelease.version === 'Unreleased') {
                    releases.push(currentRelease);
                }
                
                let releaseDate = "Present";
                try {
                    releaseDate = commit.date.substring(0, 10);
                } catch(e) {}
                
                currentRelease = {
                    version: commit.tag,
                    date: releaseDate,
                    commits: []
                };
            }
            currentRelease.commits.push(commit);
        });
        
        if (currentRelease.commits.length > 0) {
            releases.push(currentRelease);
        }
        
        if (releases.length > 1 && releases[0].version === 'Unreleased' && releases[0].commits.length === 0) {
            releases.shift();
        }
        
        // Calculate statistics
        const byType = {};
        const authorCounts = {};
        const contributorsMap = {};
        
        parsedCommits.forEach(c => {
            byType[c.type] = (byType[c.type] || 0) + 1;
            const key = `${c.author}|${c.email}`;
            authorCounts[key] = (authorCounts[key] || 0) + 1;
            if (c.avatar) {
                contributorsMap[key] = c.avatar;
            }
        });
        
        const contributors = Object.keys(authorCounts).map(k => {
            const parts = k.split("|");
            return {
                name: parts[0],
                email: parts[1],
                commits: authorCounts[k],
                avatar: contributorsMap[k] || null
            };
        }).sort((a,b) => b.commits - a.commits);
        
        return {
            repoName: repoData.name,
            repoUrl: repoUrl,
            generatedAt: new Date().toISOString(),
            stats: {
                totalCommits: parsedCommits.length,
                totalContributors: contributors.length,
                contributors: contributors,
                byType: byType
            },
            releases: releases,
            repoData: repoData
        };
    } catch(e) {
        console.error("Error fetching live GitHub changelog details:", e);
        return null;
    }
}

async function triggerLiveGitHubSync(repoUrl) {
    isFetchingLive = true;
    
    const repoTitleEl = document.getElementById("repo-title");
    const originalText = repoTitleEl.textContent;
    repoTitleEl.innerHTML = `<span class="loading-spinner" style="width:14px; height:14px; margin-right:8px; border-width:2px; vertical-align:middle; display:inline-block;"></span> Syncing GitHub Live Data...`;
    
    const liveData = await fetchRealGitHubChangelog(repoUrl);
    isFetchingLive = false;
    
    if (liveData) {
        liveData.isLive = true;
        initializeDashboard(liveData);
    } else {
        repoTitleEl.textContent = originalText;
    }
}

