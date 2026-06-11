#!/usr/bin/env node
/**
 * Capture screenshots de l'application Harmony pour le rapport.
 * Usage: node scripts/capture-screenshots.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'assets', 'screenshots');
const BASE = 'http://127.0.0.1:8000';

fs.mkdirSync(OUT, { recursive: true });

async function login(page, email = 'test@example.com', password = '123456') {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(login)?$/, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);
}

async function shot(page, name, url, waitMs = 2000) {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(waitMs);
    const file = path.join(OUT, `${name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log('✓', name);
    return file;
}

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

try {
    await shot(page, '01-login', `${BASE}/login`, 1500);
    await shot(page, '02-register', `${BASE}/register`, 1500);

    await login(page);
    await shot(page, '03-dashboard', `${BASE}/`, 3000);
    await shot(page, '04-chat', `${BASE}/chat`, 2500);
    await shot(page, '05-notifications', `${BASE}/notifications`, 2500);

    const userId = await page.evaluate(() => localStorage.getItem('user_id'));
    if (userId) {
        await shot(page, '06-profile', `${BASE}/profile/${userId}`, 2500);
    }
} catch (e) {
    console.error('Erreur capture:', e.message);
    process.exitCode = 1;
} finally {
    await browser.close();
}

// Encode all screenshots to base64 JSON
const manifest = {};
for (const f of fs.readdirSync(OUT).filter((x) => x.endsWith('.png'))) {
    const buf = fs.readFileSync(path.join(OUT, f));
    manifest[f.replace('.png', '')] = `data:image/png;base64,${buf.toString('base64')}`;
}
fs.writeFileSync(path.join(__dirname, 'assets', 'screenshots-b64.json'), JSON.stringify(manifest, null, 0));
console.log('Manifest base64:', Object.keys(manifest).length, 'captures');
