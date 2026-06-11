# Annexes UML — Diagrammes Mermaid (Harmony)

> Complément au fichier `Rapport_Synthese_Projet.docx` — à exporter en images pour insertion Word si nécessaire.

## Figure 1 — Diagramme de cas d'utilisation

```mermaid
flowchart LR
    subgraph Acteurs
        V((Visiteur))
        U((Utilisateur))
        R((Système Reverb))
    end

    subgraph Cas_d_utilisation
        UC01[S'inscrire]
        UC02[Se connecter]
        UC03[Gérer profil]
        UC04[Publier post]
        UC05[Liker post]
        UC06[Commenter]
        UC07[Suivre utilisateur]
        UC08[Consulter notifications]
        UC09[Envoyer message]
        UC10[Consulter conversations]
        UC11[Diffuser événement]
    end

    V --> UC01
    V --> UC02
    U --> UC03
    U --> UC04
    U --> UC05
    U --> UC06
    U --> UC07
    U --> UC08
    U --> UC09
    U --> UC10
    R --> UC11
    UC04 -.include.-> UC05
    UC04 -.include.-> UC06
```

## Figure 2 — Diagramme de classes

```mermaid
classDiagram
    class User {
        +Long id
        +String name
        +String email
        +String password
        +Boolean is_online
        +DateTime last_seen_at
        +posts()
        +comments()
        +likes()
        +profile()
        +followers()
        +following()
    }

    class Profil {
        +Long id
        +Long user_id
        +String username
        +String profile_image
        +String bio
    }

    class Post {
        +Long id
        +Long user_id
        +String title
        +String content
        +String image
        +comments()
        +likes()
    }

    class Comment {
        +Long id
        +Long user_id
        +Long post_id
        +String content
    }

    class Like {
        +Long id
        +Long user_id
        +Long post_id
    }

    class Notification {
        +Long id
        +Long from_user_id
        +Long to_user_id
        +String type
        +JSON data
        +Boolean is_read
    }

    class Message {
        +Long id
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
    User "*" -- "*" User : suit via Follow
```

## Figure 3 — Séquence : Authentification

```mermaid
sequenceDiagram
    participant C as React Login
    participant API as AuthController
    participant DB as Base de données
    participant E as Laravel Echo

    C->>API: POST /api/login {email, password}
    API->>DB: Auth::attempt()
    DB-->>API: User validé
    API->>DB: createToken('token')
    API-->>C: {user, token}
    C->>C: localStorage.setItem(token)
    C->>E: initEcho() Bearer token
    E-->>C: Connexion WebSocket Reverb
```

## Figure 4 — Séquence : Message temps réel

```mermaid
sequenceDiagram
    participant SW as ChatWindow (émetteur)
    participant API as ChatController
    participant RV as Laravel Reverb
    participant RW as ChatWindow (récepteur)
    participant NV as Navbar

    SW->>API: POST /api/messages
    API->>API: Message::create()
    API->>RV: broadcast(MessageSent)
    RV-->>RW: .MessageSent sur chat.{receiver_id}
    RV-->>NV: .MessageSent sur chat.{receiver_id}
    RW->>RW: setMessages() mise à jour UI
    NV->>API: GET /api/messages/unread-count
    API-->>NV: {count: N}
```

## Figure 5 — Séquence : Like + Notification

```mermaid
sequenceDiagram
    participant PC as PostCard
    participant LC as LikeController
    participant RV as Reverb
    participant NV as Navbar

    PC->>LC: POST /api/likes/toggle
    LC->>LC: Like::create()
    LC->>RV: broadcast(GotNewLike)
    LC->>LC: Notification::create()
    LC->>RV: broadcast(GotNewNotification)
    RV-->>PC: .GotNewLike sur post.{id}
    RV-->>NV: .GotNewNotification sur User.{id}
    NV->>NV: fetchUnread() badge +1
```

## Figure 6 — Diagramme d'activité : Publication post

```mermaid
flowchart TD
    A([Début]) --> B[Utilisateur ouvre Dashboard]
    B --> C[Saisie titre, contenu, image]
    C --> D{Champs valides?}
    D -->|Non| C
    D -->|Oui| E[POST /api/posts]
    E --> F{Validation Laravel OK?}
    F -->|Non| G[Afficher erreur]
    G --> C
    F -->|Oui| H[Stockage image public/posts]
    H --> I[Post::create en BDD]
    I --> J[Rafraîchir InfinitePostList]
    J --> K([Fin])
```

## Figure 7 — Diagramme de composants

```mermaid
flowchart TB
    subgraph Frontend
        React[React SPA]
        Echo[Laravel Echo + echoManager]
        RR[React Router]
    end

    subgraph Backend
        API[routes/api.php]
        CTRL[Controllers]
        EVT[Events Broadcast]
        REV[Reverb WebSocket]
    end

    subgraph Data
        ORM[Eloquent ORM]
        DB[(SQLite/MySQL)]
        FS[Storage public]
    end

    subgraph Auth
        SAN[Sanctum Tokens]
        BC[Broadcast Auth]
    end

    React --> API
    Echo --> REV
    Echo --> BC
    API --> CTRL
    CTRL --> ORM
    CTRL --> EVT
    EVT --> REV
    ORM --> DB
    CTRL --> FS
    API --> SAN
    BC --> SAN
```

## Figure 8 — Diagramme de déploiement

```mermaid
flowchart TB
    subgraph Client
        BR[Navigateur Web]
    end

    subgraph Serveur_Developpement
        ART[php artisan serve :8000]
        VIT[Vite Dev Server]
        REV[reverb:start :8080]
        QUE[queue:listen]
    end

    subgraph Persistance
        SQL[(database.sqlite)]
        PUB[storage/app/public]
    end

    BR -->|HTTP/HTTPS| ART
    BR -->|WebSocket ws://| REV
    BR -->|HMR| VIT
    ART --> SQL
    ART --> PUB
    ART --> REV
    ART --> QUE
```
