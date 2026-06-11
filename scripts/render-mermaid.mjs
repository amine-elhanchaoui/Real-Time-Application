#!/usr/bin/env node
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'assets', 'diagrams');
fs.mkdirSync(OUT, { recursive: true });

const THEME = `%%{init: {'theme': 'base', 'themeVariables': {
  'primaryColor': '#e8f0fe',
  'primaryTextColor': '#003366',
  'primaryBorderColor': '#003366',
  'secondaryColor': '#f3e8ff',
  'tertiaryColor': '#fef3c7',
  'lineColor': '#003366',
  'fontFamily': 'Segoe UI, Arial'
}}}%%`;

const diagrams = {
    'use-case': `${THEME}
flowchart TB
    subgraph Acteurs
        V((Visiteur))
        U((Utilisateur authentifié))
        R((Système Reverb))
    end
    subgraph Authentification
        UC01[S'inscrire]
        UC02[Se connecter]
    end
    subgraph Social
        UC03[Gérer profil]
        UC04[Publier / consulter posts]
        UC05[Liker / commenter]
        UC06[Suivre utilisateur]
    end
    subgraph Communication
        UC07[Envoyer message]
        UC08[Consulter conversations]
        UC09[Consulter notifications]
    end
    subgraph Temps_reel
        UC10[Recevoir événements live]
    end
    V --> UC01 & UC02
    U --> UC03 & UC04 & UC05 & UC06 & UC07 & UC08 & UC09
    R --> UC10
    UC04 -.-> UC05
    UC07 -.-> UC10
    UC09 -.-> UC10`,

    'classes': `${THEME}
classDiagram
    class User {
        +Long id
        +String name
        +String email
        +Boolean is_online
        +posts()
        +profile()
        +followers()
        +following()
    }
    class Profil {
        +Long user_id
        +String username
        +String bio
        +String profile_image
    }
    class Post {
        +Long user_id
        +String title
        +String content
        +String image
        +comments()
        +likes()
    }
    class Comment {
        +Long user_id
        +Long post_id
        +String content
    }
    class Like {
        +Long user_id
        +Long post_id
    }
    class Notification {
        +Long from_user_id
        +Long to_user_id
        +String type
        +Boolean is_read
    }
    class Message {
        +Long sender_id
        +Long receiver_id
        +String body
        +DateTime read_at
    }
    class Follow {
        +Long follower_id
        +Long following_id
    }
    User "1" -- "1" Profil : possède
    User "1" -- "*" Post : publie
    User "1" -- "*" Comment : écrit
    User "1" -- "*" Like : attribue
    User "1" -- "*" Notification : reçoit
    User "1" -- "*" Message : envoie
    Post "1" -- "*" Comment : contient
    Post "1" -- "*" Like : reçoit
    User "*" -- "*" User : suit via Follow`,

    'sequence-auth': `${THEME}
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant R as React Login
    participant API as AuthController
    participant DB as Base de données
    participant E as Laravel Echo
    U->>R: Saisie email + mot de passe
    R->>API: POST /api/login
    API->>DB: Auth::attempt()
    DB-->>API: User validé
    API->>DB: createToken Sanctum
    API-->>R: JSON user + token
    R->>R: localStorage token
    R->>E: initEcho() Bearer token
    E-->>R: WebSocket connecté
    R-->>U: Redirection Dashboard`,

    'sequence-message': `${THEME}
sequenceDiagram
    autonumber
    actor A as Utilisateur A
    participant SW as ChatWindow
    participant API as ChatController
    participant DB as BDD
    participant RV as Laravel Reverb
    participant RW as Utilisateur B
    participant NV as Navbar
    A->>SW: Tape message + Envoyer
    SW->>API: POST /api/messages
    API->>DB: Message::create()
    API->>RV: broadcast MessageSent
    API-->>SW: HTTP 201 message
    RV-->>RW: .MessageSent chat.{id}
    RW->>RW: Affichage instantané
    RV-->>NV: .MessageSent
    NV->>API: GET unread-count
    API-->>NV: Badge messages +1`,

    'sequence-notification': `${THEME}
sequenceDiagram
    autonumber
    actor U as Utilisateur
    participant PC as PostCard
    participant LC as LikeController
    participant DB as BDD
    participant RV as Reverb
    participant NV as Navbar
    U->>PC: Clic Like
    PC->>LC: POST /api/likes/toggle
    LC->>DB: Like::create()
    LC->>DB: Notification::create()
    LC->>RV: GotNewNotification
    RV-->>NV: événement WebSocket
    NV->>NV: Badge notifications +1`,
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const manifest = {};
for (const [name, code] of Object.entries(diagrams)) {
    const html = `<!DOCTYPE html><html><head>
      <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
      <style>body{background:#fff;padding:24px;margin:0}</style>
    </head><body>
      <div class="mermaid">${code}</div>
      <script>mermaid.initialize({startOnLoad:true,securityLevel:'loose'});</script>
    </body></html>`;
    await page.setContent(html);
    await page.waitForTimeout(3500);
    const el = await page.$('.mermaid svg');
    const file = path.join(OUT, `${name}.png`);
    if (el) {
        await el.screenshot({ path: file });
        manifest[name] = `data:image/png;base64,${fs.readFileSync(file).toString('base64')}`;
        console.log('✓', name);
    }
}
await browser.close();
fs.writeFileSync(path.join(__dirname, 'assets', 'diagrams-b64.json'), JSON.stringify(manifest));
console.log('Diagrammes:', Object.keys(manifest).length);
