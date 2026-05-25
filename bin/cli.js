#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { generateChangelog } from '../lib/parser.js';
import { startServer } from '../lib/server.js';
import { readConfig, deleteConfig } from '../lib/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PACKAGE_ROOT = path.resolve(__dirname, '..');

const BANNER = `
 ██████╗██╗  ██╗ █████╗ ███╗   ██╗ ██████╗ ███████╗     ██████╗ ██████╗ ██████╗ ██╗████████╗
██╔════╝██║  ██║██╔══██╗████╗  ██║██╔════╝ ██╔════╝    ██╔═══██╗██╔══██╗██╔══██╗██║╚══██╔══╝
██║     ███████║███████║██╔██╗ ██║██║  ███╗█████╗░░    ██║   ██║██████╔╝██████╔╝██║   ██║   
██║     ██╔══██║██╔══██║██║╚██╗██║██║   ██║██╔══╝░░    ██║   ██║██╔══██╗██╔══██╗██║   ██║   
╚██████╗██║  ██║██║  ██║██║ ╚████║╚██████╔╝███████╗    ╚██████╔╝██║  ██║██████╔╝██║   ██║   
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝     ╚══════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝   ╚═╝   
`;

function openBrowser(url) {
    const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${start} ${url}`, (err) => {
        if (err) {
            // Ignore error or log silently
        }
    });
}

function showHelp() {
    console.log(BANNER);
    console.log(`ChangeOrbit — Visual Conventional Commit Changelog Generator`);
    console.log(`\nUsage:`);
    console.log(`  changeorbit [options]           Generate changelog in current workspace`);
    console.log(`  changeorbit serve [options]     Generate changelog and start dashboard web server`);
    console.log(`  changeorbit export <dir>        Copy visual dashboard static files to a target directory`);
    console.log(`  changeorbit logout              Clear active GitHub authentication session`);
    console.log(`  changeorbit status              Check active session login status`);
    
    console.log(`\nOptions:`);
    console.log(`  -r, --repo <path>       Path to Git repository (default: ".")`);
    console.log(`  -o, --output <path>     Directory to write CHANGELOG.md & changelog.json (default: ".")`);
    console.log(`  --repo-url <url>        Base URL of web Git provider (to link commits)`);
    console.log(`  --strict                Strict mode (ignores non-conventional commits)`);
    console.log(`  -s, --serve             Start dashboard server immediately after generation`);
    console.log(`  -v, --verbose           Print detailed debug logs`);
    console.log(`  -h, --help              Show help information`);
    
    console.log(`\nExamples:`);
    console.log(`  npx changeorbit`);
    console.log(`  npx changeorbit serve`);
    console.log(`  npx changeorbit export ./docs`);
    console.log();
}

function handleExport(targetDir) {
    if (!targetDir) {
        console.error("❌ Error: Please specify a target directory. Example: changeorbit export ./docs");
        process.exit(1);
    }
    
    const resolvedTarget = path.resolve(targetDir);
    const publicSrc = path.join(PACKAGE_ROOT, 'public');
    const localJson = path.join(process.cwd(), 'changelog.json');
    
    if (!fs.existsSync(localJson)) {
        console.warn("⚠️ Warning: changelog.json was not found in the current working directory. Generating it first...");
        try {
            generateChangelog({ repo: '.', outputDir: '.', verbose: false });
        } catch (e) {
            console.error(`❌ Error generating changelog: ${e.message}`);
            process.exit(1);
        }
    }
    
    try {
        fs.mkdirSync(resolvedTarget, { recursive: true });
        
        // Copy HTML, CSS, JS
        const filesToCopy = ['index.html', 'styles.css', 'app.js', 'login.html'];
        filesToCopy.forEach(file => {
            fs.copyFileSync(path.join(publicSrc, file), path.join(resolvedTarget, file));
        });
        
        // Copy changelog.json
        fs.copyFileSync(localJson, path.join(resolvedTarget, 'changelog.json'));
        
        console.log(`\n======================================================`);
        console.log(`🎉 ChangeOrbit Dashboard successfully exported!`);
        console.log(`📂 Location: ${resolvedTarget}`);
        console.log(`======================================================`);
        console.log(`You can now deploy this folder to GitHub Pages, Netlify, or any static host!\n`);
    } catch (e) {
        console.error(`❌ Failed to export files: ${e.message}`);
        process.exit(1);
    }
}

function main() {
    const args = process.argv.slice(2);
    
    // Check for help
    if (args.includes('-h') || args.includes('--help')) {
        showHelp();
        process.exit(0);
    }
    
    // Check command
    const command = args[0];
    let serveMode = false;
    let exportMode = false;
    let exportDir = '';
    
    if (command === 'logout') {
        const deleted = deleteConfig();
        if (deleted) {
            console.log("👋 Successfully logged out. GitHub session cleared.");
        } else {
            console.error("❌ Failed to clear active session.");
        }
        process.exit(0);
    }
    
    if (command === 'status') {
        const config = readConfig();
        if (config && config.user) {
            console.log(`\n👤 Logged in as: ${config.user.name} (@${config.user.login})`);
            console.log(`📧 Associated Email: ${config.user.email || 'None'}`);
            console.log(`🔑 PAT Token Set: ${config.githubToken ? 'Yes' : 'No'}\n`);
        } else {
            console.log("\n👤 Status: Not logged in. Run 'npx changeorbit serve' to authenticate.\n");
        }
        process.exit(0);
    }
    
    let sliceStart = 0;
    if (command === 'serve') {
        serveMode = true;
        sliceStart = 1;
    } else if (command === 'export') {
        exportMode = true;
        exportDir = args[1];
        sliceStart = 2;
    }
    
    const parsedArgs = {
        repo: '.',
        outputDir: '.',
        repoUrl: '',
        strict: false,
        serve: serveMode,
        verbose: false
    };
    
    // Parse flags
    const flags = args.slice(sliceStart);
    for (let i = 0; i < flags.length; i++) {
        const flag = flags[i];
        if (flag === '-r' || flag === '--repo') {
            parsedArgs.repo = flags[++i];
        } else if (flag === '-o' || flag === '--output') {
            parsedArgs.outputDir = flags[++i];
        } else if (flag === '--repo-url') {
            parsedArgs.repoUrl = flags[++i];
        } else if (flag === '--strict') {
            parsedArgs.strict = true;
        } else if (flag === '-s' || flag === '--serve') {
            parsedArgs.serve = true;
        } else if (flag === '-v' || flag === '--verbose') {
            parsedArgs.verbose = true;
        }
    }
    
    if (exportMode) {
        handleExport(exportDir);
        process.exit(0);
    }
    
    console.log(BANNER);
    
    // Verify GitHub Session
    const activeSession = readConfig();
    const isLoggedIn = activeSession && activeSession.user;
    
    if (!isLoggedIn) {
        console.log(`🔑 No active GitHub session found.`);
        console.log(`👉 Launching the ChangeOrbit Authentication Portal in your browser...`);
        
        // Start temp server on 9099 and listen for auth success callback
        const serverPort = 9099;
        
        const serverInstance = startServer(serverPort, (user) => {
            console.log(`\n======================================================`);
            console.log(`🎉 Authentication Successful! Logged in as ${user.name} (@${user.login})`);
            console.log(`🚀 Synchronizing repository timeline...`);
            
            try {
                const { jsonPath, mdPath } = generateChangelog({
                    repo: parsedArgs.repo,
                    outputDir: parsedArgs.outputDir,
                    repoUrl: parsedArgs.repoUrl,
                    strict: parsedArgs.strict,
                    verbose: parsedArgs.verbose
                });
                
                console.log(`✅ Structured Database saved to: ${jsonPath}`);
                console.log(`✅ Markdown Document saved to: ${mdPath}`);
                console.log(`======================================================\n`);
                console.log(`🌐 ChangeOrbit Dashboard is fully synced and live!`);
                console.log(`👉 Open: http://localhost:${serverPort}/changeorbit.html\n`);
            } catch (e) {
                console.error(`❌ Error generating changelog: ${e.message}`);
            }
        });
        
        // Open browser
        openBrowser(`http://localhost:${serverPort}/changeorbit.html`);
        return;
    }
    
    // Authenticated path
    console.log(`👤 Active Session: ${activeSession.user.name} (@${activeSession.user.login})`);
    console.log(`Generating ChangeOrbit logs...\n`);
    
    try {
        const { jsonPath, mdPath } = generateChangelog({
            repo: parsedArgs.repo,
            outputDir: parsedArgs.outputDir,
            repoUrl: parsedArgs.repoUrl,
            strict: parsedArgs.strict,
            verbose: parsedArgs.verbose
        });
        
        console.log(`✅ Structured Database saved to: ${jsonPath}`);
        console.log(`✅ Markdown Document saved to: ${mdPath}`);
        
        if (parsedArgs.serve) {
            startServer(9099);
        } else {
            console.log(`\n💡 To open the interactive web dashboard, run: npx changeorbit serve\n`);
        }
    } catch (e) {
        console.error(`❌ Error generating changelog: ${e.message}`);
        console.log(`Type "changeorbit --help" for options.\n`);
        process.exit(1);
    }
}

main();
