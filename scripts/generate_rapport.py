#!/usr/bin/env python3
"""Génère Rapport_Synthese_Projet.docx — bibliothèque standard uniquement."""

import zipfile
import os
from xml.sax.saxutils import escape

OUTPUT = os.path.join(os.path.dirname(__file__), "..", "Rapport_Synthese_Projet.docx")

WNS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
RNS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"

def p(text="", style=None, bold=False, center=False, size=None):
    parts = []
    if style:
        parts.append(f'<w:pPr><w:pStyle w:val="{style}"/>')
        if center:
            parts.append('<w:jc w:val="center"/>')
        parts.append('</w:pPr>')
    elif center:
        parts.append('<w:pPr><w:jc w:val="center"/></w:pPr>')
    rpr = ""
    if bold or size:
        rpr = "<w:rPr>"
        if bold:
            rpr += "<w:b/>"
        if size:
            rpr += f'<w:sz w:val="{size}"/>'
        rpr += "</w:rPr>"
    lines = text.split("\n") if text else [""]
    runs = ""
    for i, line in enumerate(lines):
        if i > 0:
            runs += "<w:br/>"
        runs += f"<w:r>{rpr}<w:t xml:space=\"preserve\">{escape(line)}</w:t></w:r>"
    return f"<w:p>{''.join(parts) if parts else ''}{runs}</w:p>"

def h1(t): return p(t, "Heading1")
def h2(t): return p(t, "Heading2")
def h3(t): return p(t, "Heading3")
def body(t): return p(t)
def bullet(t): return f'<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r><w:t>{escape(t)}</w:t></w:r></w:p>'
def empty(): return "<w:p/>"
def page_break(): return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'

CONTENT = []

def add(*items):
    CONTENT.extend(items)

# ─── PAGE DE GARDE ───
add(
    empty(), empty(), empty(),
    p("RAPPORT DE SYNTHÈSE DE PROJET", center=True, bold=True, size="56"),
    empty(),
    p("Plateforme Web Temps Réel — Harmony", center=True, bold=True, size="40"),
    p("Application de réseau social et de messagerie instantanée", center=True, size="28"),
    empty(), empty(),
    p("Stack technique : Laravel 12 · React 19 · Laravel Reverb · Sanctum", center=True, size="24"),
    empty(), empty(), empty(),
    p("Projet de fin d'études / Stage", center=True, size="24"),
    p("Année universitaire 2025–2026", center=True, size="24"),
    empty(), empty(), empty(),
    p("Réalisé par : [Nom de l'étudiant]", center=True, size="24"),
    p("Encadré par : [Nom de l'encadrant]", center=True, size="24"),
    p("Établissement : [Nom de l'établissement]", center=True, size="24"),
    page_break(),
)

# ─── REMERCIEMENTS ───
add(
    h1("Remerciements"),
    body("Je tiens à exprimer ma profonde gratitude à toutes les personnes qui ont contribué, de près ou de loin, à la réalisation de ce projet."),
    body("Mes remerciements s'adressent en premier lieu à mon encadrant pédagogique pour ses conseils avisés, sa disponibilité et son exigence constructive tout au long du développement de la plateforme Harmony."),
    body("Je remercie également l'équipe pédagogique pour la formation reçue en développement web, en architecture logicielle et en conception orientée objet, compétences directement mobilisées dans ce projet."),
    body("Enfin, je remercie ma famille et mes collègues pour leur soutien moral et technique durant les phases d'intégration du temps réel (Laravel Reverb, Laravel Echo) et de la refonte de l'interface utilisateur React."),
    page_break(),
)

# ─── RÉSUMÉ ───
add(
    h1("Résumé"),
    body("Ce rapport présente la conception, le développement et la validation de Harmony, une plateforme web full-stack combinant un réseau social et une messagerie instantanée en temps réel. L'application repose sur une architecture découplée : un backend API REST développé avec Laravel 12 (PHP 8.2+) et un frontend Single Page Application (SPA) construit avec React 19, Vite 7 et Tailwind CSS 4."),
    body("Les fonctionnalités principales incluent l'authentification par jeton (Laravel Sanctum), la publication de posts avec images, les commentaires et likes, le système de suivi (follow), les notifications en temps réel, la messagerie privée bidirectionnelle et la présence en ligne des utilisateurs. La communication temps réel est assurée par Laravel Reverb (serveur WebSocket) couplé à Laravel Echo et Pusher-js côté client."),
    body("La persistance des données s'effectue via une base relationnelle (SQLite en développement, compatible MySQL/PostgreSQL). Le projet intègre 25 tests automatisés PHPUnit couvrant l'authentification, les posts, le chat, les notifications et les interactions sociales."),
    body("Mots-clés : Laravel, React, API REST, WebSocket, Laravel Reverb, Sanctum, temps réel, réseau social, messagerie, UML."),
    page_break(),
)

# ─── TABLE DES MATIÈRES (manuelle structurée) ───
add(
    h1("Table des matières"),
    body("1. Introduction générale"),
    body("2. Contexte du projet"),
    body("3. Problématique"),
    body("4. Objectifs"),
    body("5. Présentation générale du projet"),
    body("6. Analyse des besoins"),
    body("7. Étude fonctionnelle"),
    body("8. Étude technique"),
    body("9. Analyse et conception UML"),
    body("10. Architecture de l'application"),
    body("11. Conception de la base de données"),
    body("12. Description détaillée des fonctionnalités"),
    body("13. Implémentation"),
    body("14. Sécurité et authentification"),
    body("15. Tests et validation"),
    body("16. Difficultés rencontrées"),
    body("17. Solutions apportées"),
    body("18. Résultats obtenus"),
    body("19. Perspectives d'amélioration"),
    body("20. Conclusion générale"),
    body("21. Bibliographie"),
    body("22. Annexes"),
    page_break(),
)

sections = [
(h1, "1. Introduction générale", """\
Le présent document constitue le rapport de synthèse du projet Harmony (Real-Time Application), développé dans le cadre d'un projet académique et professionnel visant la maîtrise des architectures web modernes et de la communication bidirectionnelle en temps réel.

L'application répond à un besoin croissant de plateformes collaboratives permettant aux utilisateurs de publier du contenu, d'interagir socialement (likes, commentaires, abonnements) et de communiquer instantanément via une messagerie privée, le tout sans rechargement de page.

Le projet s'inscrit dans une démarche d'ingénierie logicielle rigoureuse : analyse des besoins, modélisation UML, conception en couches (backend API, frontend SPA, couche de diffusion événementielle) et validation par tests automatisés."""),

(h1, "2. Contexte du projet", """\
Le numérique transforme les modes de communication et de partage d'information. Les réseaux sociaux professionnels et grand public (LinkedIn, Instagram, Slack) ont imposé des standards d'expérience utilisateur : flux d'actualités infini, notifications push en temps réel, messagerie instantanée et indicateurs de présence.

Dans ce contexte, le projet Harmony a été conçu comme une plateforme « Connected Digital Solutions » (identité visuelle du logo) permettant de démontrer la maîtrise d'une stack full-stack moderne : Laravel pour l'API et la logique métier, React pour l'interface, et Reverb pour le temps réel.

Le dépôt source (Real-Time-Application) contient 97 fichiers applicatifs (PHP, JSX, JS), 14 migrations de base de données, 8 contrôleurs métier, 8 modèles Eloquent, 5 événements de diffusion et 25 tests PHPUnit."""),

(h1, "3. Problématique", """\
Comment concevoir et implémenter une plateforme web sociale offrant des interactions en temps réel (messagerie, notifications, mises à jour de likes/commentaires) tout en respectant une architecture maintenable, sécurisée et testable ?

Les sous-problématiques identifiées dans le code source sont :
• Gérer l'authentification stateless entre une SPA React et une API Laravel (Sanctum).
• Diffuser des événements WebSocket vers des canaux privés authentifiés par jeton Bearer.
• Éviter les conflits de souscription WebSocket lorsque plusieurs composants React partagent le même canal.
• Assurer le routage SPA côté client tout en servant l'application via Laravel (fallback route).
• Maintenir la cohérence des compteurs de messages et notifications non lus dans la barre de navigation."""),

(h1, "4. Objectifs", """\
Objectif général : Développer une application web full-stack de réseau social avec messagerie et notifications en temps réel.

Objectifs spécifiques (dérivés des routes API et composants React) :
1. Permettre l'inscription et la connexion sécurisées (AuthController, pages Login/Register).
2. Offrir un fil d'actualités paginé avec chargement infini (PostController::index, InfinitePostList).
3. Permettre la création de posts texte + image (PostController::store, CreatePost).
4. Implémenter likes, commentaires et abonnements avec notifications (LikeController, CommentController, FollowController).
5. Fournir une messagerie privée temps réel (ChatController, MessageSent, ChatWindow).
6. Afficher les notifications et compteurs en direct (NotificationController, Navbar, GotNewNotification).
7. Gérer les profils utilisateurs avec avatar et bio (ProfileController, Profil).
8. Indiquer la présence en ligne (usePresence, canal presence-online).
9. Valider le comportement par tests PHPUnit (25 tests Feature/Unit)."""),

(h1, "5. Présentation générale du projet", """\
Harmony est une application monorepo Laravel + React. Le serveur Laravel expose une API REST sous le préfixe /api et sert le point d'entrée SPA via resources/views/welcome.blade.php et la route catch-all web.php.

Le frontend est compilé par Vite 7 et monté sur l'élément #app. React Router 7 gère les routes : /, /login, /register, /profile/:id, /notifications, /post/:id, /chat, /chat/:userId.

Le démarrage en développement s'effectue via npm start, qui lance simultanément : php artisan serve (port 8000), php artisan queue:listen, php artisan reverb:start (WebSocket port 8080), php artisan pail (logs) et vite (HMR).

Identité visuelle : thème « Aurora » (dégradés bleu-violet-magenta-teal), logo /storage/logo.jpeg, composant AuroraBackground."""),

(h1, "6. Analyse des besoins", """\
6.1 Besoins fonctionnels

| ID | Besoin | Source code |
| BF01 | S'inscrire avec nom, email, mot de passe | AuthController::register |
| BF02 | Se connecter et recevoir un token API | AuthController::login |
| BF03 | Consulter un fil de posts paginé (12/page) | PostController::index |
| BF04 | Créer, lire, modifier, supprimer des posts | PostController CRUD |
| BF05 | Commenter un post | CommentController::store |
| BF06 | Liker / unliker un post | LikeController::toggle |
| BF07 | Suivre / ne plus suivre un utilisateur | FollowController::toggle |
| BF08 | Recevoir des notifications (like, comment, follow) | Notification model |
| BF09 | Envoyer et recevoir des messages privés | ChatController::send |
| BF10 | Voir les conversations et messages non lus | ChatController::conversations |
| BF11 | Modifier son profil (nom, email, bio, photo) | ProfileController::update |
| BF12 | Voir les utilisateurs en ligne | usePresence hook |
| BF13 | Mises à jour temps réel sans rechargement | Events + Echo |

6.2 Besoins non fonctionnels
• Performance : pagination, ShouldBroadcastNow pour diffusion immédiate.
• Sécurité : auth:sanctum sur toutes les routes protégées, validation des entrées.
• Maintenabilité : séparation MVC Laravel, composants React réutilisables.
• Disponibilité temps réel : serveur Reverb dédié, gestionnaire echoManager.js.
• Testabilité : 25 tests automatisés Feature/Unit."""),

(h1, "7. Étude fonctionnelle", """\
7.1 Acteurs identifiés

| Acteur | Description |
| Visiteur | Utilisateur non authentifié ; accès Login/Register uniquement |
| Utilisateur authentifié | Membre connecté via token Sanctum ; accès complet |
| Système Reverb | Serveur WebSocket ; diffuse les événements broadcast |
| Système de stockage | Disque public Laravel ; images posts et profils |

7.2 Cas d'utilisation principaux
• UC01 — S'authentifier (login/register)
• UC02 — Gérer son profil
• UC03 — Publier un post
• UC04 — Interagir avec un post (like, commentaire)
• UC05 — Suivre un utilisateur
• UC06 — Consulter les notifications
• UC07 — Envoyer un message privé
• UC08 — Consulter les conversations
• UC09 — Voir la présence en ligne

7.3 Règles métier extraites du code
• Un utilisateur ne peut supprimer que ses propres posts (PostController::destroy).
• Un utilisateur ne peut pas se suivre lui-même (FollowController::toggle).
• Les notifications like/comment ne sont pas créées si l'auteur interagit sur son propre post.
• L'ouverture d'un historique de messages marque les messages entrants comme lus (read_at).
• Les canaux WebSocket privés vérifient l'identité via guard sanctum (routes/channels.php)."""),

(h1, "8. Étude technique", """\
8.1 Stack backend
| Composant | Version | Rôle |
| PHP | ^8.2 | Langage serveur |
| Laravel | ^12.0 | Framework MVC, ORM, routing |
| Laravel Sanctum | ^4.3 | Authentification API par token |
| Laravel Reverb | ^1.0 | Serveur WebSocket |
| Predis | ^3.4 | Client Redis (scaling Reverb optionnel) |
| SQLite/MySQL | — | Persistance relationnelle |

8.2 Stack frontend
| Composant | Version | Rôle |
| React | ^19.0 | Bibliothèque UI |
| React Router | ^7.2 | Routage SPA |
| Vite | ^7.0 | Build tool et HMR |
| Tailwind CSS | ^4.0 | Framework CSS utilitaire |
| Laravel Echo | ^2.3 | Client WebSocket |
| Pusher-js | ^8.4 | Protocole WebSocket |
| Axios | ^1.11 | Client HTTP |
| Phosphor Icons | ^2.1 | Iconographie |

8.3 Contrôleurs (8)
AuthController, PostController, ProfileController, CommentController, LikeController, NotificationController, FollowController, ChatController

8.4 Modèles Eloquent (8)
User, Profil, Post, Comment, Like, Notification, Message, Follow

8.5 Événements broadcast (5)
MessageSent, GotNewNotification, GotNewComment, GotNewLike (+ ShouldBroadcastNow)

8.6 Composants React principaux (14)
Navbar, PostCard, CreatePost, InfinitePostList, ChatWindow, NotificationItem, AuroraBackground, ConnectionStatus + pages Dashboard, Login, Register, Profile, Chat, Notifications, PostDetails

8.7 Hooks personnalisés
useEcho, useEchoPrivate, useEchoChannel, usePresence

8.8 Docker
Aucune configuration Docker n'est présente dans le dépôt ; déploiement local via artisan serve + reverb:start."""),
]

for fn, title, text in sections:
    add(fn(title))
    for para in text.strip().split("\n\n"):
        for line in para.split("\n"):
            line = line.strip()
            if line.startswith("•"):
                add(bullet(line[1:].strip()))
            elif line.startswith("|") and "---" not in line:
                add(body(line))
            elif line:
                add(body(line))
    add(empty())

# UML Section
add(page_break(), h1("9. Analyse et conception UML"))

add(h2("9.1 Diagramme de cas d'utilisation"))
add(body("Figure 1 — Diagramme de cas d'utilisation de la plateforme Harmony"))
add(body("[Diagramme UML — Cas d'utilisation]"))
add(body("ACTEURS : Visiteur | Utilisateur | Système Reverb"))
add(body("CAS D'UTILISATION :"))
for uc in [
    "UC01 S'inscrire (Visiteur)",
    "UC02 Se connecter (Visiteur)",
    "UC03 Gérer son profil (Utilisateur)",
    "UC04 Publier un post (Utilisateur)",
    "UC05 Liker un post (Utilisateur)",
    "UC06 Commenter un post (Utilisateur)",
    "UC07 Suivre un utilisateur (Utilisateur)",
    "UC08 Consulter notifications (Utilisateur)",
    "UC09 Envoyer message (Utilisateur)",
    "UC10 Consulter conversations (Utilisateur)",
    "UC11 Diffuser événement temps réel (Système Reverb)",
]:
    add(bullet(uc))

add(empty(), h3("Description des cas d'utilisation"))
uc_desc = {
    "UC01 — S'inscrire": "Le visiteur soumet nom, email et mot de passe via POST /api/register. Le système crée User + Profil, génère un token Sanctum et retourne les données utilisateur.",
    "UC02 — Se connecter": "Le visiteur soumet email/mot de passe via POST /api/login. Auth::attempt valide les credentials ; un token personnel est émis.",
    "UC04 — Publier un post": "L'utilisateur envoie titre, contenu et image optionnelle via POST /api/posts. Le post est associé à user_id = Auth::id().",
    "UC09 — Envoyer message": "L'utilisateur envoie receiver_id et body via POST /api/messages. MessageSent est diffusé sur les canaux privés chat.{sender_id} et chat.{receiver_id}.",
    "UC08 — Consulter notifications": "GotNewNotification est diffusé sur App.Models.User.{id} lors d'un like, commentaire ou follow.",
}
for k, v in uc_desc.items():
    add(h3(k), body(v))

add(h2("9.2 Diagramme de classes"))
add(body("Figure 2 — Diagramme de classes (entités métier)"))
add(body("[Diagramme UML — Classes]"))
class_info = """
CLASSE User
  Attributs : id, name, email, password, is_online, last_seen_at
  Méthodes : posts(), comments(), likes(), notifications(), profile(), followers(), following()
  Relations : 1—1 Profil | 1—* Post | 1—* Comment | 1—* Like | *—* User (follows)

CLASSE Profil
  Attributs : id, user_id, username, profile_image, bio
  Relation : *—1 User

CLASSE Post
  Attributs : id, user_id, title, content, image
  Relations : *—1 User | 1—* Comment | 1—* Like

CLASSE Message
  Attributs : id, sender_id, receiver_id, body, read_at
  Relations : *—1 User (sender) | *—1 User (receiver)

CLASSE Notification
  Attributs : id, from_user_id, to_user_id, type, data (JSON), is_read
  Relations : *—1 User (sender) | *—1 User (receiver)

CLASSE Follow (table pivot)
  Attributs : id, follower_id, following_id
  Cardinalité : un User peut suivre plusieurs Users (N—N)
"""
for line in class_info.strip().split("\n"):
    add(body(line.strip()))

add(h2("9.3 Diagrammes de séquence"))
add(body("Figure 3 — Séquence : Authentification (login)"))
add(body("1. React Login → POST /api/login {email, password}"))
add(body("2. AuthController → Auth::attempt() → User + createToken()"))
add(body("3. Réponse JSON {user, token} → localStorage (token, user_id, user_name)"))
add(body("4. window.initEcho() → connexion WebSocket Reverb avec Bearer token"))

add(empty(), body("Figure 4 — Séquence : Envoi de message temps réel"))
add(body("1. ChatWindow → POST /api/messages {receiver_id, body}"))
add(body("2. ChatController → Message::create() → broadcast(MessageSent)"))
add(body("3. Reverb → canal privé chat.{receiver_id} → événement .MessageSent"))
add(body("4. echoManager → ChatWindow + Navbar → mise à jour UI et compteurs"))

add(empty(), body("Figure 5 — Séquence : Like avec notification"))
add(body("1. PostCard → POST /api/likes/toggle {post_id}"))
add(body("2. LikeController → Like::create() → broadcast(GotNewLike) sur canal public post.{id}"))
add(body("3. Si auteur ≠ liker → Notification::create() → broadcast(GotNewNotification)"))
add(body("4. Navbar écoute App.Models.User.{id} → incrémente badge notifications"))

add(h2("9.4 Diagramme d'activité — Publication d'un post"))
for step in [
    "Début : utilisateur authentifié ouvre Dashboard",
    "Saisie titre + contenu + image optionnelle (CreatePost)",
    "Validation côté client (champs requis)",
    "POST /api/posts (multipart/form-data)",
    "Validation Laravel (title, content, image max 2Mo)",
    "Stockage image dans storage/app/public/posts",
    "Post::create() en base de données",
    "Réponse JSON → rafraîchissement InfinitePostList",
    "Fin",
]:
    add(bullet(step))

add(h2("9.5 Diagramme de composants"))
add(body("Figure 6 — Architecture composants"))
for c in [
    "Couche Présentation : React SPA (pages, components, hooks)",
    "Couche Client Temps Réel : Laravel Echo + echoManager.js + Pusher-js",
    "Couche API : routes/api.php → Controllers → Models",
    "Couche Diffusion : Events (MessageSent, etc.) → Reverb",
    "Couche Auth : Sanctum + Broadcast::routes auth:sanctum",
    "Couche Données : Eloquent ORM → SQLite/MySQL",
    "Stockage fichiers : filesystems public (posts, profile-images)",
]:
    add(bullet(c))

add(h2("9.6 Diagramme de déploiement"))
add(body("Figure 7 — Déploiement (environnement de développement)"))
for d in [
    "Nœud Client : Navigateur web (Chrome, Firefox) — React build via Vite",
    "Nœud Serveur Web : php artisan serve — port 8000 — sert API + SPA fallback",
    "Nœud WebSocket : php artisan reverb:start — port 8080",
    "Nœud Queue : php artisan queue:listen — jobs asynchrones",
    "Nœud BDD : SQLite (database/database.sqlite) ou MySQL",
    "Note : pas de conteneurs Docker dans le dépôt actuel",
]:
    add(bullet(d))

add(page_break(), h1("10. Architecture de l'application"))
add(body("L'architecture suit un modèle client-serveur découplé en trois couches logiques :"))
add(bullet("Couche présentation (React SPA) : responsable de l'UI, du routage client et des souscriptions WebSocket."))
add(bullet("Couche application (Laravel API) : expose les endpoints REST, applique la logique métier et émet les événements."))
add(bullet("Couche données (RDBMS + stockage fichiers) : persiste entités relationnelles et médias."))
add(body("Le point d'entrée unique est routes/web.php qui retourne welcome.blade.php pour toute route non-API, permettant le routage SPA et le rafraîchissement de page sans erreur 404."))

add(h1("11. Conception de la base de données"))
add(body("11.1 Schéma relationnel — 10 tables principales"))
tables = [
    ("users", "id, name, email, password, is_online, last_seen_at, timestamps"),
    ("profils", "id, user_id (FK), username (unique), profile_image, bio, timestamps"),
    ("posts", "id, user_id (FK), title, content, image, timestamps"),
    ("comments", "id, user_id (FK), post_id (FK), content, timestamps"),
    ("likes", "id, user_id (FK), post_id (FK), timestamps"),
    ("notifications", "id, from_user_id (FK), to_user_id (FK), type, data (JSON), is_read, timestamps"),
    ("messages", "id, sender_id (FK), receiver_id (FK), body, read_at, timestamps"),
    ("follows", "id, follower_id (FK), following_id (FK), unique(follower_id, following_id)"),
    ("personal_access_tokens", "Tokens Sanctum"),
    ("sessions", "Sessions web Laravel"),
]
for name, cols in tables:
    add(body(f"Table {name} : {cols}"))

add(body("11.2 Relations clés"))
add(bullet("User 1—1 Profil (hasOne / belongsTo)"))
add(bullet("User 1—* Post, Comment, Like, Message (sender/receiver), Notification"))
add(bullet("Post 1—* Comment, Like"))
add(bullet("User N—N User via table follows (followers / following)"))

add(h1("12. Description détaillée des fonctionnalités"))
features = [
    ("Authentification", "Login et register via AuthController. Token stocké en localStorage. Echo réinitialisé après connexion."),
    ("Fil d'actualités", "InfinitePostList avec IntersectionObserver ; API paginée 12 posts/page."),
    ("Posts", "CRUD complet ; upload image max 2 Mo ; suppression réservée au propriétaire."),
    ("Interactions sociales", "Like toggle, commentaires, follow avec notifications automatiques."),
    ("Messagerie", "Conversations, historique, envoi optimiste UI, read_at pour accusés de lecture."),
    ("Notifications", "Types : like, comment, follow. Badge temps réel dans Navbar via unread-count endpoints."),
    ("Profil", "Affichage posts utilisateur, édition modal, upload avatar."),
    ("Présence", "Canal presence-online ; liste utilisateurs connectés dans Dashboard."),
    ("Temps réel", "5 événements broadcast ; echoManager évite les conflits leaveChannel."),
]
for title, desc in features:
    add(h3(title), body(desc))

add(h1("13. Implémentation"))
add(body("13.1 Structure des répertoires"))
for line in [
    "app/Http/Controllers/ — 8 contrôleurs API",
    "app/Models/ — 8 modèles Eloquent",
    "app/Events/ — 5 événements broadcast",
    "routes/api.php — 30+ endpoints",
    "routes/channels.php — 3 canaux (privé, présence)",
    "resources/js/pages/ — 7 pages React",
    "resources/js/components/ — 9 composants",
    "resources/js/hooks/ — useEcho, usePresence",
    "database/migrations/ — 14 migrations",
    "tests/Feature/ — 24 tests fonctionnels",
]:
    add(bullet(line))

add(body("13.2 Endpoints API principaux"))
endpoints = [
    "POST /api/login, /api/register",
    "GET|POST|PUT|DELETE /api/posts",
    "POST /api/comments, /api/likes/toggle",
    "GET /api/notifications, /api/notifications/unread-count",
    "POST /api/notifications/{id}/read, /api/notifications/read-all",
    "POST /api/follows/toggle, GET /api/follows/{user}/check|counts",
    "GET /api/conversations, /api/messages/{userId}, POST /api/messages",
    "GET /api/messages/unread-count, POST /api/messages/{userId}/read",
    "GET|PUT /api/profile/{id}",
]
for ep in endpoints:
    add(bullet(ep))

add(h1("14. Sécurité et authentification"))
add(bullet("Laravel Sanctum : tokens personnels stockés en table personal_access_tokens."))
add(bullet("Middleware auth:sanctum sur toutes les routes API protégées (routes/api.php ligne 14)."))
add(bullet("Broadcast::routes(['middleware' => ['auth:sanctum']]) dans AppServiceProvider."))
add(bullet("Canaux privés avec guard sanctum : chat.{id}, App.Models.User.{id}, presence-online."))
add(bullet("Validation des entrées via $request->validate() dans chaque contrôleur."))
add(bullet("Hachage bcrypt des mots de passe à l'inscription."))
add(bullet("Contrôle d'autorisation : suppression post (propriétaire), notification (destinataire)."))
add(bullet("Token transmis via header Authorization: Bearer et localStorage côté client."))

add(h1("15. Tests et validation"))
add(body("Le projet comporte 25 tests automatisés PHPUnit :"))
tests = [
    "AuthControllerTest (4) : register, login, credentials invalides",
    "PostControllerTest (6) : CRUD, autorisation suppression",
    "CommentControllerTest (2) : ajout commentaire, liste par post",
    "LikeControllerTest (1) : toggle like",
    "NotificationControllerTest (3) : liste, marquer lu, autorisation",
    "NotificationTest (3) : déclenchement like/comment, unread count",
    "ChatControllerTest (3) : envoi, conversations, historique",
    "ProfileControllerTest (1) : consultation profil",
    "ExampleTest (2) : tests exemples",
]
for t in tests:
    add(bullet(t))
add(body("Exécution : php artisan test ou composer test"))

add(h1("16. Difficultés rencontrées"))
difficulties = [
    "Rafraîchissement SPA (404) : routes React non reconnues par le serveur Laravel.",
    "Temps réel non fonctionnel : BROADCAST_CONNECTION incorrect, guard sanctum manquant sur canaux.",
    "leaveChannel détruisait les souscriptions partagées entre Navbar, Chat et Notifications.",
    "Compteurs messages/notifications non mis à jour en direct dans la barre de navigation.",
    "Conflit REVERB_HOST avec guillemets dans .env.",
    "Champ from_user vs sender dans NotificationItem (incohérence API/UI).",
]
for d in difficulties:
    add(bullet(d))

add(h1("17. Solutions apportées"))
solutions = [
    "Route catch-all web.php : Route::get('{any}', ...)->where('any', '.*') pour SPA fallback.",
    "Configuration BROADCAST_CONNECTION=reverb et VITE_REVERB_* pour Echo.",
    "Ajout guard sanctum sur tous les canaux dans routes/channels.php.",
    "Création echoManager.js : subscribePrivate avec stopListening par listener.",
    "Endpoints dédiés unread-count + écoute Echo dans Navbar avec animation ping.",
    "GotNewNotification et MessageSent en ShouldBroadcastNow pour diffusion immédiate.",
    "FakeFeedSeeder : 30 utilisateurs et 120 posts avec images pour tests du scroll infini.",
]
for s in solutions:
    add(bullet(s))

add(h1("18. Résultats obtenus"))
add(body("L'application Harmony livre une plateforme fonctionnelle avec :"))
results = [
    "API REST complète (30+ endpoints) documentée par les tests.",
    "Interface React moderne (thème Aurora, Tailwind CSS 4).",
    "Messagerie temps réel sans rechargement de page.",
    "Notifications et compteurs mis à jour en direct.",
    "Fil d'actualités infini avec pagination API.",
    "120 posts et 31 utilisateurs seedés pour démonstration.",
    "Build production Vite validé (npm run build).",
]
for r in results:
    add(bullet(r))

add(h1("19. Perspectives d'amélioration"))
perspectives = [
    "Conteneurisation Docker (Sail) pour déploiement reproductible.",
    "Policies Laravel pour centraliser les autorisations.",
    "Form Requests pour validation découplée des contrôleurs.",
    "Tests E2E (Cypress/Playwright) pour le temps réel.",
    "Redis pour cache, sessions et scaling Reverb.",
    "CI/CD (GitHub Actions) avec exécution automatique des tests.",
    "Mode clair / accessibilité WCAG.",
    "Chiffrement end-to-end des messages privés.",
]
for item in perspectives:
    add(bullet(item))

add(h1("20. Conclusion générale"))
add(body("Le projet Harmony démontre la faisabilité d'une architecture web moderne combinant API REST Laravel, interface React et communication WebSocket via Laravel Reverb. L'analyse du code source révèle une structuration claire en couches, un modèle de données relationnel cohérent et une couverture de tests significative pour un projet académique."))
add(body("Les difficultés liées au temps réel et au routage SPA ont été résolues par une configuration rigoureuse de Sanctum, des canaux broadcast sécurisés et un gestionnaire de souscriptions WebSocket côté client. L'application constitue une base solide pour des évolutions professionnelles (déploiement cloud, montée en charge, fonctionnalités collaboratives avancées)."))

add(h1("21. Bibliographie"))
bib = [
    "Documentation Laravel 12 — https://laravel.com/docs/12.x",
    "Laravel Sanctum — https://laravel.com/docs/12.x/sanctum",
    "Laravel Reverb — https://laravel.com/docs/12.x/reverb",
    "Laravel Broadcasting — https://laravel.com/docs/12.x/broadcasting",
    "React 19 Documentation — https://react.dev",
    "React Router 7 — https://reactrouter.com",
    "Tailwind CSS 4 — https://tailwindcss.com/docs",
    "Laravel Echo — https://github.com/laravel/echo",
    "UML 2.5 — OMG, Unified Modeling Language",
    "PHPUnit 11 — https://phpunit.de/documentation.html",
]
for b in bib:
    add(bullet(b))

add(h1("22. Annexes"))
add(h3("Annexe A — Commandes de démarrage"))
for cmd in [
    "npm start — Lance serveur, queue, reverb, logs et Vite",
    "php artisan migrate:fresh --seed — Réinitialise la BDD",
    "php artisan test — Exécute les tests",
    "npm run build — Build production frontend",
]:
    add(bullet(cmd))

add(h3("Annexe B — Comptes de test"))
add(body("test@example.com / 123456 (utilisateur principal)"))
add(body("Utilisateurs seedés : mot de passe « password »"))

add(h3("Annexe C — Canaux WebSocket"))
for ch in [
    "private chat.{userId} — MessageSent",
    "private App.Models.User.{userId} — GotNewNotification",
    "presence-online — présence utilisateurs",
    "public post.{postId} — GotNewComment, GotNewLike",
]:
    add(bullet(ch))

# Build document.xml
body_xml = "".join(CONTENT)

document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="{WNS}" xmlns:r="{RNS}">
  <w:body>
    {body_xml}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708"/>
      <w:pgNumType w:start="1"/>
    </w:sectPr>
  </w:body>
</w:document>"""

styles_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="{WNS}">
  <w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults>
  <w:style w:type="paragraph" w:styleId="Heading1" w:default="0"><w:name w:val="heading 1"/><w:pPr><w:spacing w:before="480" w:after="240"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="1F3864"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2" w:default="0"><w:name w:val="heading 2"/><w:pPr><w:spacing w:before="360" w:after="120"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="2E5496"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading3" w:default="0"><w:name w:val="heading 3"/><w:pPr><w:spacing w:before="240" w:after="120"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="404040"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="ListParagraph" w:default="0"><w:name w:val="List Paragraph"/><w:pPr><w:ind w:left="720"/></w:pPr></w:style>
  <w:style w:type="numbering" w:styleId="Num1"><w:name w:val="Bullet"/></w:style>
</w:styles>"""

numbering_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="{WNS}">
  <w:abstractNum w:abstractNumId="0">
    <w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/></w:lvl>
  </w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>"""

content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>"""

rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>"""

doc_rels = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>"""

header_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="{WNS}">
  <w:p><w:pPr><w:jc w:val="right"/></w:pPr>
    <w:r><w:rPr><w:sz w:val="18"/><w:color w:val="808080"/></w:rPr>
      <w:t>Harmony — Rapport de Synthèse de Projet</w:t>
    </w:r>
  </w:p>
</w:hdr>"""

footer_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="{WNS}">
  <w:p><w:pPr><w:jc w:val="center"/></w:pPr>
    <w:r><w:rPr><w:sz w:val="18"/><w:color w:val="808080"/></w:rPr>
      <w:t>Page </w:t>
    </w:r>
    <w:fldSimple w:instr=" PAGE ">
      <w:r><w:t>1</w:t></w:r>
    </w:fldSimple>
  </w:p>
</w:ftr>"""

# Add header/footer refs to sectPr
document_xml = document_xml.replace(
    "<w:sectPr>",
    f"""<w:sectPr>
      <w:headerReference w:type="default" r:id="rId3" xmlns:r="{RNS}"/>
      <w:footerReference w:type="default" r:id="rId4" xmlns:r="{RNS}"/>"""
)

core_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
  xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Rapport de Synthèse — Harmony Real-Time Application</dc:title>
  <dc:creator>Étudiant — Projet Académique</dc:creator>
  <dc:description>Rapport UML et synthèse technique du projet Laravel + React</dc:description>
  <cp:keywords>Laravel, React, Reverb, Sanctum, UML, temps réel</cp:keywords>
</cp:coreProperties>"""

app_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>Harmony Report Generator</Application>
  <Pages>45</Pages>
  <Words>8000</Words>
</Properties>"""

os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
with zipfile.ZipFile(OUTPUT, "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml", content_types)
    z.writestr("_rels/.rels", rels)
    z.writestr("word/document.xml", document_xml)
    z.writestr("word/styles.xml", styles_xml)
    z.writestr("word/numbering.xml", numbering_xml)
    z.writestr("word/header1.xml", header_xml)
    z.writestr("word/footer1.xml", footer_xml)
    z.writestr("word/_rels/document.xml.rels", doc_rels)
    z.writestr("docProps/core.xml", core_xml)
    z.writestr("docProps/app.xml", app_xml)

print(f"Rapport généré : {os.path.abspath(OUTPUT)}")
print(f"Taille : {os.path.getsize(OUTPUT) // 1024} Ko")
