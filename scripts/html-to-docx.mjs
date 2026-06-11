#!/usr/bin/env node
/**
 * Convertit docs/rapport-harmony.html → Rapport_Synthese_Projet.docx
 * Utilise html-docx-js (conversion HTML → Word via MHTML)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const htmlDocx = require('html-docx-js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const HTML_PATH = path.join(ROOT, 'docs', 'rapport-harmony.html');
const OUTPUT = path.join(ROOT, 'Rapport_Synthese_Projet.docx');

if (!fs.existsSync(HTML_PATH)) {
    console.error('Fichier HTML introuvable. Exécutez d\'abord: node scripts/build-rapport-html.mjs');
    process.exit(1);
}

console.log('Lecture HTML...');
const html = fs.readFileSync(HTML_PATH, 'utf8');
console.log(`  Taille HTML: ${(html.length / 1024).toFixed(0)} Ko`);

console.log('Conversion html-docx-js...');
const result = htmlDocx.asBlob(html, {
    orientation: 'portrait',
    margins: {
        top: 1440,
        right: 1200,
        bottom: 1440,
        left: 1200,
        header: 720,
        footer: 720,
    },
});

let buffer;
if (Buffer.isBuffer(result)) {
    buffer = result;
} else if (result instanceof Blob) {
    buffer = Buffer.from(await result.arrayBuffer());
} else {
    buffer = Buffer.from(new Uint8Array(result));
}

fs.writeFileSync(OUTPUT, buffer);
const sizeKb = (fs.statSync(OUTPUT).size / 1024).toFixed(0);
console.log(`✓ Rapport Word généré: ${OUTPUT}`);
console.log(`  Taille: ${sizeKb} Ko`);

// Vérification basique
const sig = buffer.subarray(0, 2).toString('utf8');
if (sig === 'PK') {
    console.log('✓ Format ZIP/DOCX valide (signature PK)');
} else {
    console.warn('⚠ Signature inattendue — vérifier le fichier manuellement');
}
