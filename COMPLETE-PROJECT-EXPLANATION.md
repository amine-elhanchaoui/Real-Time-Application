# 🚀 Complete Beginner Guide to Your Real-Time Social Media App (Laravel + React + Reverb)

## 📖 Table of Contents
- [1. Big Picture Architecture](#architecture)
- [2. Database & Models (Data Layer)](#models)
- [3. Routes & Controllers (Logic Layer)](#controllers)
- [4. Real-Time Broadcasting (Magic Layer)](#realtime)
- [5. React Frontend (UI Layer)](#frontend)
- [6. Full Communication Flows](#flows)
- [7. Key Concepts Glossary](#glossary)
- [8. Run & Test](#run)

## 🏗️ 1. Architecture Graph

```
┌─────────────────┐     HTTP API       ┌──────────────────┐     DB Queries    ┌─────────────┐
│   React App     │◄──────────────────►│  Laravel API     │◄────────────────►│ MySQL DB    │
│ (Vite/Echo.js)  │  (Axios)           │ (Controllers)    │  (Eloquent)      │ (Tables)    │
└─────────┬───────┘                    └────────┬─────────┘                 └─────────────┘
          │                                    │
     WebSockets                         Events/Broadcast
          │                                    │
          ▼                                    ▼
┌──────────┴─────────┐                ┌──────┴──────┐
│ Laravel Reverb     │◄───────────────►│ Channels    │
│ (WebSocket Server) │  JSON Payloads  │ (post.123)  │
└────────────────────┘                └─────────────┘
```

**Layers**:
- **Frontend**: React components → User clicks → Axios/WebSocket.
- **Backend**: PHP Controllers → DB → Events.
- **Real-Time**: Reverb broadcasts to channels → Echo receives.
- **Data**: MySQL with relationships.

## 🗄️ 2. Database & Models {#models}

**6 Tables** (from migrations):
1. `users`: id, name, email, password.
2. `profils`: user_id, bio, image.
3. `posts`: id, user_id, title, content, image.
4. `comments`: id, user_id, post_id, content.
5. `likes`: id, user_id, post_id.
6. `notifications`: id, from_user_id, to_user_id, type, data.

**Model Relationships Graph**:
```
User ──1:N──> Posts    Post ──1:N──> Comments
  │              │              │
1:1              │              │
  └─> Profil     N:1 <── User   N:1 <── User
User ──1:N──> Likes ──┐
  │                  │
1:N <── Notifications ─┼── 1:N <── User (sender)
                      │
                 1:N <── User (receiver)
```

**Key Methods** (all models extend `Model`):
- Relationships: `hasMany`, `belongsTo` → Magic queries like `$post->comments`.
- `fillable`: Safe fields for `create/update`.

## 🔗 3. Routes & Controllers {#controllers}

**api.php Routes**:
```
Public:
├── POST /api/login (AuthController.login)
├── POST /api/register (AuthController.register)

Protected (auth:sanctum):
├── GET/POST api/posts (PostController CRUD)
├── GET /profile/{id} (ProfileController.show)
├── POST /comments (CommentController.store)
├── GET /posts/{id}/comments (CommentController.getByPostId)
├── POST /likes/toggle (LikeController.toggle)
├── GET /notifications (NotificationController.index)
├── GET /notifications/unread-count
└── POST /notifications/{id}/read (markAsRead)
```

**Controller Methods Breakdown**:

### AuthController
- `login(Request)`: Validate email/pass → `Auth::attempt` → Sanctum token → JSON.
- `register(Request)`: Validate → `User::create` → Login → Token.

### PostController (apiResource = index/store/show/update/destroy)
```
index(Request): Post::with(relations)->paginate(10)  // List with likes/comments
store(Request): Validate title/content/image → Upload image → Post::create → JSON
show($id): Post::with(relations)->findOrFail($id)
update(Request $id): Post::find($id)->update
destroy($id): if owner → delete
```

### CommentController
```
store(Request):
 1. Validate post_id/content
 2. Comment::create(user_id, post_id, content)
 3. load('user.profile')
 4. broadcast(GotNewComment(post_id, $comment))->toOthers()
 5. Notify post owner: Notification::create → broadcast(GotNewNotification)
getByPostId($id): Comment::with('user')->where(post_id=$id)
```

**LikeController/NotificationController/ProfileController**: Similar CRUD + broadcasts.

## ⚡ 4. Real-Time Broadcasting {#realtime}

**Events** (all `implements ShouldBroadcast`):
```
GotNewComment($postId, $comment)
├── broadcastOn(): Channel('post.' . $postId)  // Public!
├── broadcastAs(): 'GotNewComment'
└── Data: {postId, comment}

GotNewLike, GotNewNotification (private User.{id})
```

**Flow Graph**:
```
User Posts Comment
         │
         ▼
CommentController.store
  ├── DB Save
  ├── GotNewComment Event
  │    ├── Channel: post.{id} (public)
  │    └── Event: .GotNewComment
  └── Notification → GotNewNotification (private)
         │
         ▼
Reverb → Echo.js (all browsers)
         │
         ▼
React: onRefresh() → New UI!
```

**Channels.php**: Only auth for private `App.Models.User.{id}`. Post channels public.

**Config**: broadcasting.php → 'reverb' driver.

## 📱 5. React Frontend {#frontend}

**App Structure** (app.jsx):
```
Router:
├── / → Dashboard (InfinitePostList)
├── /login → Login form → axios POST /api/login
├── /register → Register → POST /api/register
├── /profile/:id → Profile page
├── /notifications → List + real-time
└── /post/:id → PostDetails
```

**Key Components & Hooks**:
- **Navbar**: `useEffect` → Echo.private(`User.${id}`) → `.GotNewNotification` → Update unreadCount.
- **PostCard**: `useEffect` → Echo.channel(`post.${id}`) → `.GotNewComment`/`.GotNewLike` → Refresh.
- **CreatePost**: Form state → axios POST → onPostCreated callback.
- `useInfiniteQuery?` No, custom infinite scroll in InfinitePostList.

**Echo Usage**:
```jsx
useEffect(() => {
  window.Echo.channel(`post.${post.id}`).listen('.GotNewComment', (e) => onRefresh());
  return () => window.Echo.leaveChannel(...);
}, []);
```

## 🔄 6. Communication Flows {#flows}

**Full Post + Comment Flow**:
```
1. Load Dashboard → GET /api/posts → PostController.index → Posts with relations
2. Create Post → POST /api/posts → Store → JSON → Add to list
3. View Post → Echo join 'post.{id}'
4. Comment → POST /api/comments → Store → Broadcast → Echo → Refresh comments
5. Like → POST /api/likes/toggle → Toggle → Broadcast
6. Notification → Private channel → Navbar bell ++
```

**Auth Flow Graph**:
```
Register/Login → POST /api/register → Token
     │
     ▼
localStorage.token → axios.defaults.headers
     │
     ▼
All protected requests: Bearer {token}
```

## 📚 7. Concepts Glossary {#glossary}

- **REST API**: Standard endpoints (GET/POST/PUT/DELETE).
- **Sanctum**: Token auth for APIs/SPA.
- **Eloquent**: ActiveRecord ORM (Model = Table row).
- **Relationships**: hasMany/belongsTo = JOINs.
- **Middleware**: Guards (auth, validate).
- **Broadcasting**: Events over WebSockets.
- **Hooks**: React state/effects.
- **useEffect Cleanup**: Prevent memory leaks.

## 🛠️ 8. Run & Test {#run}

```bash
# Backend
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve

# Real-time
php artisan reverb:start

# Frontend
npm install
npm run dev

# Test: Open 2 tabs → Comment → Instant update! ✨
```

**Files Overview**:
```
app/Models/: Data classes
app/Http/Controllers/: Logic
app/Events/: Real-time triggers
routes/api.php: Endpoints
resources/js/: React UI
config/broadcasting.php: Reverb setup
```

This covers **100%** of your code! Questions? Edit this MD. 🚀
