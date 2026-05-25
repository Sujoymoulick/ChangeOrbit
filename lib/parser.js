import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Conventional Commits Category Mapping
const CATEGORY_MAPPING = {
    'feat': { title: 'Features 🚀', priority: 1 },
    'fix': { title: 'Bug Fixes 🐛', priority: 2 },
    'perf': { title: 'Performance Improvements ⚡', priority: 3 },
    'refactor': { title: 'Refactoring 🛠️', priority: 4 },
    'docs': { title: 'Documentation 📝', priority: 5 },
    'style': { title: 'Code Style ✨', priority: 6 },
    'test': { title: 'Tests 🧪', priority: 7 },
    'build': { title: 'Build System 📦', priority: 8 },
    'ci': { title: 'Continuous Integration ⚙️', priority: 9 },
    'chore': { title: 'Maintenance & Chore 🧹', priority: 10 },
    'other': { title: 'Other Changes 📝', priority: 11 }
};

const CONVENTIONAL_REGEX = /^(\w+)(?:\(([^)]+)\))?(!)?:\s+(.*)$/;
const TAG_REGEX = /tag:\s*([^,\)]+)/;

export function getRepoName(repoPath) {
    return path.basename(path.resolve(repoPath));
}

export function getRemoteUrl(repoPath) {
    try {
        let url = execSync('git remote get-url origin', { cwd: repoPath, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
        if (url.startsWith('git@')) {
            url = url.replace(':', '/').replace('git@', 'https://');
        }
        if (url.endsWith('.git')) {
            url = url.slice(0, -4);
        }
        return url;
    } catch (e) {
        return '';
    }
}

export function runGitLog(repoPath) {
    const gitFormat = "%H|%an|%ae|%ad|%s|%d";
    try {
        const output = execSync(`git log --date=iso-strict --pretty=format:"${gitFormat}"`, { 
            cwd: repoPath, 
            stdio: ['pipe', 'pipe', 'ignore'],
            maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        }).toString();
        return output.split('\n');
    } catch (e) {
        throw new Error("Failed to execute git log. Make sure this is a Git repository with at least one commit.");
    }
}

export function parseCommits(logLines, strict = false) {
    const commits = [];
    
    for (const line of logLines) {
        if (!line.trim()) continue;
        
        // Find index of first 5 pipes
        const parts = [];
        let temp = line;
        for (let i = 0; i < 5; i++) {
            const idx = temp.indexOf('|');
            if (idx === -1) break;
            parts.push(temp.substring(0, idx));
            temp = temp.substring(idx + 1);
        }
        parts.push(temp); // The remainder containing subject and decoration
        
        if (parts.length < 5) continue;
        
        const commitHash = parts[0];
        const authorName = parts[1];
        const authorEmail = parts[2];
        const dateStr = parts[3];
        const remainder = parts[4];
        
        // Split remainder into subject and decoration (decoration is inside parens at the end)
        // e.g. "feat(main): subject| (HEAD -> master, tag: v1.0.0)"
        let subject = remainder;
        let decoration = '';
        const pipeIdx = remainder.lastIndexOf('|');
        if (pipeIdx !== -1) {
            subject = remainder.substring(0, pipeIdx);
            decoration = remainder.substring(pipeIdx + 1);
        }
        
        // Extract tag if present
        let tag = null;
        const tagMatch = TAG_REGEX.exec(decoration);
        if (tagMatch) {
            tag = tagMatch[1].trim();
        }
        
        // Parse Conventional Commits
        const match = CONVENTIONAL_REGEX.exec(subject);
        let cType = 'other';
        let scope = null;
        let breaking = false;
        let description = subject;
        
        if (match) {
            cType = match[1].toLowerCase();
            scope = match[2] || null;
            breaking = !!match[3];
            description = match[4];
        } else {
            if (strict) continue;
            cType = 'other';
            scope = null;
            breaking = false;
            description = subject;
        }
        
        if (!CATEGORY_MAPPING[cType]) {
            cType = 'other';
        }
        
        commits.push({
            hash: commitHash,
            shortHash: commitHash.substring(0, 7),
            author: authorName,
            email: authorEmail,
            date: dateStr,
            rawSubject: subject,
            type: cType,
            scope: scope,
            isBreaking: breaking,
            description: description,
            tag: tag
        });
    }
    
    return commits;
}

export function groupByReleases(commits) {
    const releases = [];
    let currentRelease = {
        version: 'Unreleased',
        date: 'Present',
        commits: []
    };
    
    for (const commit of commits) {
        if (commit.tag) {
            if (currentRelease.commits.length > 0 || currentRelease.version === 'Unreleased') {
                releases.push(currentRelease);
            }
            
            let releaseDate = commit.date.substring(0, 10);
            
            currentRelease = {
                version: commit.tag,
                date: releaseDate,
                commits: []
            };
        }
        currentRelease.commits.push(commit);
    }
    
    if (currentRelease.commits.length > 0) {
        releases.push(currentRelease);
    }
    
    if (releases.length > 1 && releases[0].version === 'Unreleased' && releases[0].commits.length === 0) {
        releases.shift();
    }
    
    return releases;
}

export function calculateStatistics(commits) {
    const totalCommits = commits.length;
    const authorCounts = {};
    const byType = {};
    
    for (const commit of commits) {
        const key = `${commit.author}|${commit.email}`;
        authorCounts[key] = (authorCounts[key] || 0) + 1;
        byType[commit.type] = (byType[commit.type] || 0) + 1;
    }
    
    const contributors = Object.keys(authorCounts).map(k => {
        const [name, email] = k.split('|');
        return { name, email, commits: authorCounts[k] };
    }).sort((a, b) => b.commits - a.commits);
    
    return {
        totalCommits,
        totalContributors: contributors.length,
        contributors,
        byType
    };
}

export function generateMarkdownChangelog(data) {
    const md = [];
    md.push(`# Changelog`);
    md.push(`\nAll notable changes to the **${data.repoName}** project will be documented in this file.`);
    md.push(`\n*Generated automatically by [ChangeOrbit](https://github.com) on ${new Date().toISOString().substring(0, 10)}*`);
    md.push(`\n---`);
    
    for (const release of data.releases) {
        md.push(`\n## [${release.version}] - ${release.date}`);
        
        const grouped = {};
        for (const commit of release.commits) {
            grouped[commit.type] = grouped[commit.type] || [];
            grouped[commit.type].push(commit);
        }
        
        const sortedTypes = Object.keys(grouped).sort((a, b) => {
            return (CATEGORY_MAPPING[a]?.priority || 99) - (CATEGORY_MAPPING[b]?.priority || 99);
        });
        
        for (const t of sortedTypes) {
            const catTitle = CATEGORY_MAPPING[t]?.title || 'Other Changes 📝';
            md.push(`\n### ${catTitle}`);
            
            for (const commit of grouped[t]) {
                const scopeStr = commit.scope ? `**${commit.scope}**: ` : '';
                const breakingStr = commit.isBreaking ? '⚠️ **BREAKING CHANGE**: ' : '';
                
                let hashLink = `\`${commit.shortHash}\``;
                if (data.repoUrl) {
                    hashLink = `[${commit.shortHash}](${data.repoUrl}/commit/${commit.hash})`;
                }
                
                md.push(`- ${breakingStr}${scopeStr}${commit.description} (${hashLink}) by *${commit.author}*`);
            }
        }
    }
    
    return md.join('\n');
}

export function generateChangelog({ repo = '.', outputDir = '.', repoUrl = '', strict = false, verbose = false }) {
    if (!fs.existsSync(path.join(repo, '.git'))) {
        throw new Error(`Path '${repo}' is not a valid Git repository.`);
    }
    
    const repoName = getRepoName(repo);
    const resolvedUrl = repoUrl || getRemoteUrl(repo);
    
    if (verbose) {
        console.log(`Analyzing repository: ${repoName}`);
        console.log(`Detected Remote URL: ${resolvedUrl || 'None'}`);
    }
    
    const logLines = runGitLog(repo);
    if (logLines.length === 0 || (logLines.length === 1 && !logLines[0].trim())) {
        throw new Error("No commits found in repository.");
    }
    
    const commits = parseCommits(logLines, strict);
    const releases = groupByReleases(commits);
    const stats = calculateStatistics(commits);
    
    const changelogData = {
        repoName,
        repoUrl: resolvedUrl,
        generatedAt: new Date().toISOString(),
        stats,
        releases
    };
    
    // Save JSON
    fs.mkdirSync(outputDir, { recursive: true });
    const jsonPath = path.join(outputDir, 'changelog.json');
    fs.writeFileSync(jsonPath, JSON.stringify(changelogData, null, 2), 'utf-8');
    
    // Save Markdown
    const mdContent = generateMarkdownChangelog(changelogData);
    const mdPath = path.join(outputDir, 'CHANGELOG.md');
    fs.writeFileSync(mdPath, mdContent, 'utf-8');
    
    return { jsonPath, mdPath, changelogData };
}
