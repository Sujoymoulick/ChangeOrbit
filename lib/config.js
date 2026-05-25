import os from 'os';
import fs from 'fs';
import path from 'path';

const CONFIG_DIR = path.join(os.homedir(), '.changeorbit');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export function readConfig() {
    try {
        if (!fs.existsSync(CONFIG_FILE)) return null;
        const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

export function writeConfig(config) {
    try {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
        return true;
    } catch (e) {
        return false;
    }
}

export function deleteConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            fs.unlinkSync(CONFIG_FILE);
        }
        return true;
    } catch (e) {
        return false;
    }
}
