#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const META = {
    etudiant: 'Amine Elhachaoui',
    encadrant: 'Housna Oumni',
    etablissement: 'ISTA NTIC Safi',
    filiere: 'Développement Digital — Option Full Stack',
    annee: '2025–2026',
};

const readJson = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, 'assets', f), 'utf8'));
const ofppt = `data:image/png;base64,${fs.readFileSync(path.join(__dirname, 'assets', 'ofppt-logo.b64.txt'), 'utf8').trim()}`;
const shots = readJson('screenshots-b64.json');
const diagrams = readJson('diagrams-b64.json');
const harmonyLogo = fs.existsSync(path.join(ROOT, 'public/storage/logo.jpeg'))
    ? `data:image/jpeg;base64,${fs.readFileSync(path.join(ROOT, 'public/storage/logo.jpeg')).toString('base64')}`
    : '';

const img = (src, caption, id) => src ? `
<figure class="figure" id="fig-${id}">
  <div class="figure-frame"><img src="${src}" alt="${caption}" /></div>
  <figcaption><span class="fig-num">Figure ${id}</span> — ${caption}</figcaption>
</figure>` : '';

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Rapport de Synthèse — Harmony | ${META.etudiant}</title>
  <style>
    @page { size: A4; margin: 2cm; }
    :root {
      --ofppt-blue: #003366;
      --ofppt-blue-light: #1a5276;
      --ofppt-gold: #C5A572;
      --ofppt-gold-light: #f5ead8;
      --harmony-violet: #7c3aed;
      --harmony-indigo: #4f46e5;
      --harmony-teal: #14b8a6;
      --text: #1e293b;
      --muted: #64748b;
      --border: #e2e8f0;
      --bg-soft: #f8fafc;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Calibri, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.7;
      color: var(--text);
      max-width: 210mm;
      margin: 0 auto;
      padding: 0 24px 48px;
      background: #fff;
    }

    /* ── PAGE DE GARDE ── */
    .cover {
      page-break-after: always;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(160deg, #f0f4f8 0%, #fff 40%, #f5f0ff 100%);
      border-bottom: 5px solid var(--ofppt-blue);
      padding: 48px 32px;
      margin: 0 -24px;
    }
    .cover-logos { display: flex; gap: 48px; align-items: center; margin-bottom: 36px; }
    .cover-logos img { height: 100px; object-fit: contain; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1)); }
    .cover-badge {
      background: var(--ofppt-blue);
      color: #fff;
      padding: 10px 28px;
      border-radius: 6px;
      font-size: 9pt;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 28px;
    }
    .cover h1 { font-size: 24pt; color: var(--ofppt-blue); font-weight: 800; margin-bottom: 8px; }
    .cover h2 { font-size: 15pt; color: var(--harmony-violet); font-weight: 600; margin-bottom: 32px; }
    .cover-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 32px;
      text-align: left;
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px 32px;
      max-width: 520px;
      box-shadow: 0 8px 24px rgba(0,51,102,0.08);
    }
    .cover-grid .label { font-size: 9pt; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .cover-grid .value { font-size: 11pt; font-weight: 600; color: var(--ofppt-blue); }

    /* ── TITRES ── */
    h1.section-title {
      font-size: 20pt;
      color: #fff;
      background: linear-gradient(135deg, var(--ofppt-blue) 0%, var(--ofppt-blue-light) 100%);
      padding: 14px 24px;
      border-radius: 8px;
      margin: 36px 0 20px;
      page-break-after: avoid;
      border-left: 5px solid var(--ofppt-gold);
    }
    h2.sub-title {
      font-size: 13pt;
      color: var(--ofppt-blue);
      border-bottom: 2px solid var(--ofppt-gold);
      padding-bottom: 6px;
      margin: 24px 0 14px;
      page-break-after: avoid;
    }
    h3 { font-size: 11pt; color: var(--harmony-violet); margin: 16px 0 8px; font-weight: 700; }
    p { margin-bottom: 12px; text-align: justify; }
    .page-break { page-break-before: always; }

    /* ── REMERCIEMENTS ── */
    .thanks-box {
      background: linear-gradient(135deg, var(--ofppt-gold-light) 0%, #fff 100%);
      border: 1px solid var(--ofppt-gold);
      border-radius: 12px;
      padding: 28px 32px;
      margin: 16px 0;
    }
    .thanks-box p { font-size: 11pt; line-height: 1.85; margin-bottom: 14px; }
    .thanks-box p:last-child { margin-bottom: 0; }
    .thanks-highlight {
      display: inline-block;
      background: var(--ofppt-blue);
      color: #fff;
      padding: 2px 10px;
      border-radius: 4px;
      font-weight: 600;
    }

    /* ── RÉSUMÉ GRID ── */
    .resume-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 20px 0;
    }
    .resume-card {
      background: var(--bg-soft);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 18px 20px;
      border-top: 3px solid var(--harmony-violet);
    }
    .resume-card.gold { border-top-color: var(--ofppt-gold); }
    .resume-card.teal { border-top-color: var(--harmony-teal); }
    .resume-card.blue { border-top-color: var(--ofppt-blue); }
    .resume-card .card-icon { font-size: 20pt; margin-bottom: 6px; }
    .resume-card .card-title { font-size: 10pt; font-weight: 700; color: var(--ofppt-blue); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; }
    .resume-card .card-text { font-size: 10pt; color: var(--muted); line-height: 1.6; }
    .resume-full {
      grid-column: 1 / -1;
      background: linear-gradient(135deg, #ede9fe 0%, #f0f4f8 100%);
      border: 1px solid #c4b5fd;
      border-radius: 10px;
      padding: 20px 24px;
      margin-bottom: 4px;
    }
    .keywords-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }
    .keyword {
      background: var(--ofppt-blue);
      color: #fff;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 9pt;
      font-weight: 500;
    }

    /* ── TABLEAUX ── */
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 10pt; page-break-inside: avoid; }
    thead th {
      background: linear-gradient(135deg, var(--ofppt-blue), var(--ofppt-blue-light));
      color: #fff;
      padding: 10px 14px;
      text-align: left;
      font-weight: 600;
    }
    tbody td { border: 1px solid var(--border); padding: 9px 14px; vertical-align: top; }
    tbody tr:nth-child(even) td { background: var(--bg-soft); }
    tbody tr:hover td { background: #ede9fe; }

    /* ── DIAGRAMMES ── */
    .diagram-section {
      background: var(--bg-soft);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin: 20px 0;
      page-break-inside: avoid;
    }
    .diagram-section h2 { margin-top: 0; }
    .figure { margin: 16px 0; text-align: center; }
    .figure-frame {
      background: #fff;
      border: 2px solid var(--border);
      border-radius: 10px;
      padding: 16px;
      box-shadow: 0 4px 16px rgba(0,51,102,0.06);
    }
    .figure img { max-width: 100%; height: auto; }
    .figure figcaption { font-size: 9pt; color: var(--muted); margin-top: 10px; }
    .fig-num { font-weight: 700; color: var(--ofppt-blue); }

    /* ── DESCRIPTION CARDS (UML) ── */
    .desc-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 16px 0;
    }
    .desc-card {
      background: #fff;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      border-left: 4px solid var(--harmony-violet);
    }
    .desc-card .uc-id { font-size: 9pt; font-weight: 700; color: var(--harmony-violet); }
    .desc-card .uc-name { font-size: 10pt; font-weight: 700; color: var(--ofppt-blue); margin: 4px 0; }
    .desc-card .uc-desc { font-size: 9pt; color: var(--muted); line-height: 1.5; }

    /* ── INFO BOX ── */
    .info-box {
      background: #eff6ff;
      border-left: 4px solid var(--ofppt-blue);
      padding: 14px 18px;
      border-radius: 0 8px 8px 0;
      margin: 14px 0;
      font-size: 10pt;
    }

    ul { margin: 0 0 12px 20px; }
    li { margin-bottom: 5px; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 9pt; color: var(--harmony-violet); }
    .header-bar {
      font-size: 9pt;
      color: var(--muted);
      text-align: right;
      border-bottom: 1px solid var(--border);
      padding: 8px 0 12px;
      margin-bottom: 20px;
    }
    .toc { list-style: none; padding: 0; }
    .toc li { padding: 8px 14px; border-bottom: 1px solid var(--border); }
    .toc li:nth-child(odd) { background: var(--bg-soft); }
    .toc a { color: var(--ofppt-blue); text-decoration: none; font-weight: 500; }
  </style>
</head>
<body>

<!-- ══════════════ PAGE DE GARDE ══════════════ -->
<div class="cover">
  <div class="cover-logos">
    <img src="${ofppt}" alt="Logo OFPPT" />
    ${harmonyLogo ? `<img src="${harmonyLogo}" alt="Logo Harmony" style="border-radius:14px" />` : ''}
  </div>
  <div class="cover-badge">Office de la Formation Professionnelle et de la Promotion du Travail</div>
  <h1>RAPPORT DE SYNTHÈSE DE PROJET</h1>
  <h2>Harmony — Plateforme Web Temps Réel</h2>
  <div class="cover-grid">
    <div><div class="label">Réalisé par</div><div class="value">${META.etudiant}</div></div>
    <div><div class="label">Encadré par</div><div class="value">${META.encadrant}</div></div>
    <div><div class="label">Établissement</div><div class="value">${META.etablissement}</div></div>
    <div><div class="label">Filière</div><div class="value">${META.filiere}</div></div>
    <div><div class="label">Année universitaire</div><div class="value">${META.annee}</div></div>
    <div><div class="label">Stack technique</div><div class="value">Laravel 12 · React 19 · Reverb</div></div>
  </div>
</div>

<div class="header-bar">${META.etablissement} · ${META.etudiant} · ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>

<!-- ══════════════ REMERCIEMENTS ══════════════ -->
<h1 class="section-title" id="remerciements">Remerciements</h1>
<div class="thanks-box">
  <p>
    Je tiens à exprimer ma sincère gratitude à <span class="thanks-highlight">${META.encadrant}</span>,
    mon encadrante pédagogique, pour son accompagnement précieux, ses conseils avisés et sa disponibilité
    tout au long de la réalisation de ce projet de fin de formation.
  </p>
  <p>
    Je remercie également l'ensemble de l'équipe pédagogique de l'<span class="thanks-highlight">${META.etablissement}</span>
    pour la qualité de la formation en développement digital, qui m'a permis d'acquérir les compétences
    nécessaires en architecture web, conception UML et développement full-stack.
  </p>
  <p>
    Mes remerciements vont enfin à ma famille et à mes camarades de promotion pour leur soutien moral
    et technique durant les phases les plus exigeantes du projet, notamment l'intégration du temps réel
    avec <strong>Laravel Reverb</strong> et la conception de l'interface <strong>React</strong>.
  </p>
</div>

<!-- ══════════════ RÉSUMÉ ══════════════ -->
<h1 class="section-title" id="resume">Résumé</h1>

<div class="resume-full">
  <p style="margin:0;font-size:11pt;line-height:1.8">
    Ce rapport présente la conception, le développement et la validation de <strong>Harmony</strong>,
    une plateforme web full-stack combinant <strong>réseau social</strong> et <strong>messagerie instantanée en temps réel</strong>.
    Le backend API REST est développé avec <strong>Laravel 12</strong> (PHP 8.2+) et le frontend SPA avec
    <strong>React 19</strong>, <strong>Vite 7</strong> et <strong>Tailwind CSS 4</strong>.
    La communication temps réel est assurée par <strong>Laravel Reverb</strong> et <strong>Laravel Echo</strong>.
  </p>
</div>

<div class="resume-grid">
  <div class="resume-card blue">
    <div class="card-icon">⚙️</div>
    <div class="card-title">Backend</div>
    <div class="card-text">Laravel 12, Sanctum, 8 contrôleurs, 30+ endpoints API REST, 5 événements broadcast</div>
  </div>
  <div class="resume-card">
    <div class="card-icon">🖥️</div>
    <div class="card-title">Frontend</div>
    <div class="card-text">React 19 SPA, 7 pages, 9 composants, scroll infini, thème Aurora</div>
  </div>
  <div class="resume-card teal">
    <div class="card-icon">⚡</div>
    <div class="card-title">Temps réel</div>
    <div class="card-text">Reverb WebSocket, Echo, messagerie live, notifications et badges instantanés</div>
  </div>
  <div class="resume-card gold">
    <div class="card-icon">🗄️</div>
    <div class="card-title">Base de données</div>
    <div class="card-text">10 tables relationnelles, 8 modèles Eloquent, SQLite/MySQL</div>
  </div>
  <div class="resume-card">
    <div class="card-icon">✅</div>
    <div class="card-title">Tests</div>
    <div class="card-text">25 tests PHPUnit — auth, posts, chat, notifications, likes</div>
  </div>
  <div class="resume-card blue">
    <div class="card-icon">👥</div>
    <div class="card-title">Démonstration</div>
    <div class="card-text">31 utilisateurs seedés, 120 posts avec images (FakeFeedSeeder)</div>
  </div>
</div>

<div class="keywords-bar">
  <span class="keyword">Laravel</span>
  <span class="keyword">React</span>
  <span class="keyword">API REST</span>
  <span class="keyword">WebSocket</span>
  <span class="keyword">Reverb</span>
  <span class="keyword">Sanctum</span>
  <span class="keyword">Temps réel</span>
  <span class="keyword">UML</span>
  <span class="keyword">OFPPT</span>
</div>

<!-- ══════════════ TABLE DES MATIÈRES ══════════════ -->
<h1 class="section-title page-break" id="toc">Table des matières</h1>
<ol class="toc">
  <li><a href="#remerciements">Remerciements</a></li>
  <li><a href="#resume">Résumé</a></li>
  <li><a href="#uml">Analyse et conception UML</a></li>
  <li><a href="#use-case">— Diagramme de cas d'utilisation</a></li>
  <li><a href="#classes">— Diagramme de classes</a></li>
  <li><a href="#sequence">— Diagrammes de séquence</a></li>
  <li><a href="#description">— Description des fonctionnalités</a></li>
  <li><a href="#captures">Captures d'écran</a></li>
  <li><a href="#conclusion">Conclusion</a></li>
</ol>

<!-- ══════════════ UML ══════════════ -->
<h1 class="section-title page-break" id="uml">Analyse et Conception UML</h1>
<p>Cette section présente la modélisation UML du projet Harmony, basée sur l'analyse du code source réel : modèles Eloquent, contrôleurs, événements broadcast et composants React.</p>

<!-- USE CASE -->
<div class="diagram-section" id="use-case">
  <h2 class="sub-title">Diagramme de cas d'utilisation</h2>
  ${img(diagrams['use-case'], "Diagramme de cas d'utilisation — Plateforme Harmony", "1")}
  <div class="desc-grid">
    <div class="desc-card"><div class="uc-id">UC01</div><div class="uc-name">S'inscrire</div><div class="uc-desc">Visiteur crée un compte via POST /api/register. Création User + Profil + token Sanctum.</div></div>
    <div class="desc-card"><div class="uc-id">UC02</div><div class="uc-name">Se connecter</div><div class="uc-desc">Auth::attempt + émission token. Initialisation Echo WebSocket.</div></div>
    <div class="desc-card"><div class="uc-id">UC03</div><div class="uc-name">Gérer profil</div><div class="uc-desc">Consultation et modification nom, email, bio, photo (ProfileController).</div></div>
    <div class="desc-card"><div class="uc-id">UC04</div><div class="uc-name">Publier posts</div><div class="uc-desc">CRUD posts avec image. Fil paginé 12/page, scroll infini.</div></div>
    <div class="desc-card"><div class="uc-id">UC05</div><div class="uc-name">Liker / Commenter</div><div class="uc-desc">Interactions sociales + notification temps réel au propriétaire du post.</div></div>
    <div class="desc-card"><div class="uc-id">UC06</div><div class="uc-name">Suivre</div><div class="uc-desc">Relation follower/following via table pivot follows.</div></div>
    <div class="desc-card"><div class="uc-id">UC07</div><div class="uc-name">Envoyer message</div><div class="uc-desc">Messagerie privée. broadcast(MessageSent) sur canaux chat.{id}.</div></div>
    <div class="desc-card"><div class="uc-id">UC08</div><div class="uc-name">Conversations</div><div class="uc-desc">Liste partenaires, dernier message, compteur non lus.</div></div>
    <div class="desc-card"><div class="uc-id">UC09</div><div class="uc-name">Notifications</div><div class="uc-desc">Types like, comment, follow. Badge navbar temps réel.</div></div>
  </div>
</div>

<!-- CLASS DIAGRAM -->
<div class="diagram-section page-break" id="classes">
  <h2 class="sub-title">Diagramme de classes</h2>
  ${img(diagrams['classes'], "Diagramme de classes — Entités métier Eloquent", "2")}
  <table>
    <thead><tr><th>Classe</th><th>Attributs clés</th><th>Relations</th></tr></thead>
    <tbody>
      <tr><td><strong>User</strong></td><td>id, name, email, password, is_online</td><td>1—1 Profil, 1—* Post, Message, Notification</td></tr>
      <tr><td><strong>Profil</strong></td><td>user_id, username, bio, profile_image</td><td>*—1 User</td></tr>
      <tr><td><strong>Post</strong></td><td>user_id, title, content, image</td><td>*—1 User, 1—* Comment, Like</td></tr>
      <tr><td><strong>Comment</strong></td><td>user_id, post_id, content</td><td>*—1 User, *—1 Post</td></tr>
      <tr><td><strong>Like</strong></td><td>user_id, post_id</td><td>*—1 User, *—1 Post</td></tr>
      <tr><td><strong>Notification</strong></td><td>from_user_id, to_user_id, type, data, is_read</td><td>*—1 User (sender/receiver)</td></tr>
      <tr><td><strong>Message</strong></td><td>sender_id, receiver_id, body, read_at</td><td>*—1 User (sender/receiver)</td></tr>
      <tr><td><strong>Follow</strong></td><td>follower_id, following_id</td><td>Table pivot N—N entre Users</td></tr>
    </tbody>
  </table>
</div>

<!-- SEQUENCE DIAGRAMS -->
<div class="diagram-section page-break" id="sequence">
  <h2 class="sub-title">Diagrammes de séquence</h2>

  <h3>Séquence 1 — Authentification (Sanctum)</h3>
  ${img(diagrams['sequence-auth'], "Authentification : Login → Token → Echo WebSocket", "3a")}
  <div class="info-box">
    L'utilisateur saisit ses identifiants. <code>AuthController::login</code> valide via <code>Auth::attempt()</code>,
    crée un token Sanctum stocké en <code>localStorage</code>, puis <code>initEcho()</code> établit la connexion WebSocket
    authentifiée pour le temps réel.
  </div>

  <h3>Séquence 2 — Envoi de message temps réel</h3>
  ${img(diagrams['sequence-message'], "Message : POST API → Reverb → Affichage instantané", "3b")}
  <div class="info-box">
    <code>ChatController::send</code> crée le message et diffuse <code>MessageSent</code> (ShouldBroadcastNow)
    sur les canaux privés <code>chat.{sender_id}</code> et <code>chat.{receiver_id}</code>.
    Le récepteur affiche le message sans rechargement ; la Navbar met à jour le badge.
  </div>

  <h3>Séquence 3 — Like avec notification</h3>
  ${img(diagrams['sequence-notification'], "Like → Notification → Badge navbar temps réel", "3c")}
  <div class="info-box">
    Un like déclenche <code>GotNewLike</code> (canal public post.{id}) et <code>GotNewNotification</code>
    (canal privé App.Models.User.{id}) si le liker n'est pas le propriétaire du post.
  </div>
</div>

<!-- DESCRIPTION -->
<div class="diagram-section page-break" id="description">
  <h2 class="sub-title">Description des fonctionnalités</h2>
  <table>
    <thead><tr><th>Module</th><th>Fonctionnalité</th><th>Technologie</th><th>Endpoint / Composant</th></tr></thead>
    <tbody>
      <tr><td>Authentification</td><td>Inscription & connexion par token</td><td>Laravel Sanctum</td><td>POST /api/login, /api/register</td></tr>
      <tr><td>Fil d'actualités</td><td>Posts paginés, scroll infini</td><td>React + IntersectionObserver</td><td>GET /api/posts, InfinitePostList</td></tr>
      <tr><td>Publications</td><td>CRUD posts + upload image</td><td>Laravel Storage</td><td>PostController, CreatePost</td></tr>
      <tr><td>Interactions</td><td>Likes, commentaires, follows</td><td>Eloquent + Events</td><td>LikeController, CommentController</td></tr>
      <tr><td>Messagerie</td><td>Chat privé temps réel</td><td>Reverb + Echo</td><td>ChatController, ChatWindow</td></tr>
      <tr><td>Notifications</td><td>Alertes like/comment/follow</td><td>GotNewNotification</td><td>NotificationController, Navbar</td></tr>
      <tr><td>Présence</td><td>Utilisateurs en ligne</td><td>Canal presence-online</td><td>usePresence hook</td></tr>
      <tr><td>Profil</td><td>Avatar, bio, statistiques</td><td>Profil model</td><td>ProfileController, Profile.jsx</td></tr>
    </tbody>
  </table>
</div>

<!-- CAPTURES -->
<h1 class="section-title page-break" id="captures">Captures d'écran</h1>
<p>Interface Harmony en fonctionnement — ${META.etablissement}, projet réalisé par ${META.etudiant}.</p>
${img(shots['01-login'], "Page de connexion", "4a")}
${img(shots['03-dashboard'], "Tableau de bord — fil d'actualités infini", "4b")}
${img(shots['04-chat'], "Messagerie temps réel", "4c")}
${img(shots['05-notifications'], "Centre de notifications", "4d")}

<!-- CONCLUSION -->
<h1 class="section-title page-break" id="conclusion">Conclusion</h1>
<p>
  Le projet <strong>Harmony</strong>, réalisé par <strong>${META.etudiant}</strong> sous l'encadrement de
  <strong>${META.encadrant}</strong> à l'<strong>${META.etablissement}</strong>, démontre la maîtrise d'une
  architecture web moderne full-stack : API REST Laravel, interface React et communication WebSocket via Reverb.
</p>
<p>
  Les objectifs pédagogiques ont été atteints : conception UML, implémentation sécurisée (Sanctum), temps réel
  fonctionnel, tests automatisés (25 tests) et interface utilisateur moderne. Ce projet constitue une base solide
  pour une carrière en développement digital.
</p>

</body>
</html>`;

const out = path.join(ROOT, 'docs', 'rapport-harmony.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html, 'utf8');
console.log('✓ HTML généré:', out);
console.log('  Étudiant:', META.etudiant);
console.log('  Taille:', (fs.statSync(out).size / 1024).toFixed(0), 'Ko');
