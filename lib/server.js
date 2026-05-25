import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readConfig, writeConfig, deleteConfig } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../public');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

export function startServer(port = 9099, onLoginSuccess = null) {
    const server = http.createServer((req, res) => {
        
        // GET /api/user-config -> Return active config
        if (req.url === '/api/user-config' && req.method === 'GET') {
            const config = readConfig();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(config || {}));
            return;
        }

        // POST /api/logout -> Delete active config
        if (req.url === '/api/logout' && req.method === 'POST') {
            deleteConfig();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'success' }));
            return;
        }

        // POST /api/login-success -> Save user credentials and trigger CLI launch
        if (req.url === '/api/login-success' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    writeConfig(data);
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ status: 'success' }));

                    // Notify CLI that authentication completed
                    if (onLoginSuccess) {
                        setTimeout(() => {
                            onLoginSuccess(data.user);
                        }, 500);
                    }
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
                }
            });
            return;
        }

        let filePath = '';
        
        // Intercept and serve changelog.json from the user's CURRENT working directory
        if (req.url === '/changelog.json') {
            filePath = path.join(process.cwd(), 'changelog.json');
            
            if (!fs.existsSync(filePath)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'changelog.json not found. Run "changeorbit" first to generate it.' }));
                return;
            }
        } else {
            // State-based Root Routing
            let reqUrl = req.url;
            if (reqUrl === '/' || reqUrl === '/index.html') {
                reqUrl = '/index.html'; // Serve public landing page
            } else if (reqUrl === '/changeorbit.html') {
                const activeSession = readConfig();
                if (activeSession && activeSession.user) {
                    reqUrl = '/changeorbit.html'; // Logged in: serve dashboard
                } else {
                    reqUrl = '/login.html'; // Not logged in: serve authorization portal
                }
            }
            
            filePath = path.join(PUBLIC_DIR, reqUrl);
            
            // Security: Prevent Directory Traversal Attacks
            if (!filePath.startsWith(PUBLIC_DIR) && req.url !== '/changelog.json') {
                res.writeHead(403, { 'Content-Type': 'text/plain' });
                res.end('Forbidden');
                return;
            }
        }
        
        // Serve file if exists
        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                } else {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end(`Internal Server Error: ${err.code}`);
                }
            } else {
                const ext = path.extname(filePath).toLowerCase();
                const mime = MIME_TYPES[ext] || 'application/octet-stream';
                res.writeHead(200, { 'Content-Type': mime });
                res.end(content, 'utf-8');
            }
        });
    });

    // Handle port collision gracefully by auto-incrementing
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.warn(`⚠️ Port ${port} is currently in use. Retrying on port ${port + 1}...`);
            startServer(port + 1, onLoginSuccess);
        } else {
            console.error(`Error starting web server: ${err.message}`);
        }
    });

    server.listen(port, '127.0.0.1', () => {
        const activeSession = readConfig();
        if (activeSession && activeSession.user) {
            console.log(`\n======================================================`);
            console.log(`🌐 ChangeOrbit Interactive Dashboard is running!`);
            console.log(`👉 Open: http://localhost:${port}/changeorbit.html`);
            console.log(`======================================================\n`);
        } else {
            console.log(`\n======================================================`);
            console.log(`🔑 ChangeOrbit GitHub Login Server is active!`);
            console.log(`👉 Authenticate here: http://localhost:${port}/changeorbit.html`);
            console.log(`======================================================\n`);
        }
    });

    return server;
}
