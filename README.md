# Project "Sosyal" Technical Documentation

## 1. Overview
**Sosyal** is a modern social media platform designed for visual sharing and community interaction. It allows users to upload photos, follow other users, exchange private messages, and customize their profiles. The platform focuses on a clean, responsive user experience with a robust backend to handle real-time social interactions.

---

## 2. Architecture
The project follows a standard **MVC (Model-View-Controller)** pattern built on the **MEN stack** (MongoDB, Express.js, Node.js).

- **Backend**: Node.js with Express.js framework.
- **Database**: MongoDB (Atlas) using Mongoose ODM.
- **Frontend**: SSR (Server-Side Rendering) using EJS template engine.
- **File Storage**: Cloudinary (for cloud-based image management).
- **Authentication**: JWT (JSON Web Tokens) stored in HTTP-only cookies, with password hashing via bcrypt.

---

## 3. Tech Stack & Dependencies

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime** | Node.js | Server-side execution |
| **Framework** | Express.js | Web application framework |
| **Database** | MongoDB / Mongoose | Data persistence and modeling |
| **View Engine** | EJS | Dynamic HTML rendering |
| **Auth** | JWT / bcrypt | Security and session management |
| **Storage** | Cloudinary | Image hosting and transformations |
| **File Upload** | express-fileupload | Multipart form handling & temp files |
| **Mailing** | Nodemailer | Email notifications (Contact page) |
| **Utilities** | validator / dotenv | Data validation and environment config |

---

## 4. Core Features

### 📸 Photo Management
- Multi-column responsive photo grid (3 columns, responsive breakpoints).
- Photo uploading with descriptions and titles via Cloudinary.
- **Search**: Case-insensitive search by photo name or description with debounced auto-submit.
- **Pagination**: 12 photos per page with smart page windowing.
- Likes and Dislikes toggle system.
- **Comments**:
  - Users can post comments on photos with commenter avatars.
  - Users can **edit** their own comments inline.
  - Users can **delete** their own comments.
  - Photo owners can delete any comment on their photos.
- Photo update and delete with Cloudinary sync.

### 👤 User Profile Management
- **Profile Photo (Avatar)**:
  - Users can upload/change their profile photo from the dashboard.
  - Profile photos are uploaded to Cloudinary with automatic face-crop transformation (400x400).
  - Users can remove their profile photo (reverts to default).
  - Profile photos are displayed across the entire platform:
    - Dashboard (own profile)
    - User profile pages (other users' profiles)
    - Users list page
    - Followers / Following lists
    - Comments section (commenter avatars)
    - Messages list (conversation avatars)
    - Message detail / Chat header
    - Photo detail page (artist avatar)

- **Bio (About Me)**:
  - Users can write up to 500 characters about themselves.
  - Bio is editable from the dashboard with a live character counter.
  - Other users can see the bio when visiting a profile page.
  - Bio preview is shown on the users list page (truncated to 2 lines).

- **Profile Stats**: Followers count, Following count, Photos count displayed on dashboard and profile pages.

### 🔍 Users Search & Pagination
- **Search**: Case-insensitive username search with debounced auto-submit (600ms).
- **Pagination**: 12 users per page with smart page windowing (max 5 visible buttons + ellipsis).
- **Result Count**: Shows total matching users and current search term.
- **Empty State**: Friendly message when no users match the search.
- **Query Params**: `?search=term&page=1` — search term persisted across pagination links.

### 🔗 Social Features
- Follow/Unfollow mechanism with method-override PUT requests.
- Followers and Following lists with real avatars.
- Personalized dashboards.

### ✉️ Messaging System
- Private one-on-one messaging.
- Rich text editor with bold, italic, underline formatting.
- Image and video attachment support (inline via base64).
- Real-time conversation view with auto-scroll.
- Conversation partner avatars in message list and chat header.

---

## 5. Data Models (Schema)

### User Model (`userModel.js`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `username` | String (unique, lowercase, alphanumeric) | User's display name |
| `email` | String (unique, validated) | User's email address |
| `password` | String (hashed, min 4 chars) | Bcrypt hashed password |
| `avatar.url` | String | Profile photo URL (default: `/images/profile_1.jpg`) |
| `avatar.public_id` | String | Cloudinary public ID for deletion |
| `bio` | String (max 500 chars, trimmed) | About me / bio text |
| `followers` | [ObjectId → User] | Array of follower user references |
| `followings` | [ObjectId → User] | Array of following user references |
| `timestamps` | Auto | `createdAt` and `updatedAt` |

### Photo Model (`photoModel.js`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | String | Photo title |
| `description` | String | Photo description |
| `url` | String | Cloudinary hosted image URL |
| `image_id` | String | Cloudinary public ID |
| `user` | ObjectId → User | Reference to uploader |
| `comments` | [{ text, postedBy, createdAt }] | Sub-documents with author refs |
| `likes` | [ObjectId → User] | Users who liked |
| `dislikes` | [ObjectId → User] | Users who disliked |
| `uploadedAt` | Date | Upload timestamp |

### Message Model (`messageModel.js`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `from` | ObjectId → User | Sender reference |
| `to` | ObjectId → User | Receiver reference |
| `text` | String | Message content (supports HTML) |
| `createdAt` | Date | Timestamp |

---

## 6. API Routes

### Page Routes (`pageRoute.js`)
| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/` | Home page |
| GET | `/about` | About page |
| GET | `/contact` | Contact page |
| POST | `/contact` | Send contact email |
| GET | `/login` | Login page |
| GET | `/register` | Register page |
| GET | `/logout` | Logout (clear JWT cookie) |

### User Routes (`userRoute.js`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| POST | `/users/register` | No | Create new account |
| POST | `/users/login` | No | Login & get JWT cookie |
| GET | `/users/dashboard` | ✅ | Dashboard page |
| POST | `/users/dashboard/avatar` | ✅ | Upload/change profile photo |
| POST | `/users/dashboard/avatar/delete` | ✅ | Remove profile photo |
| POST | `/users/dashboard/bio` | ✅ | Update bio/about text |
| GET | `/users?search=&page=` | ✅ | All users list (search + pagination) |
| GET | `/users/:id` | ✅ | User profile page |
| PUT | `/users/:id/follow` | ✅ | Follow a user |
| PUT | `/users/:id/unfollow` | ✅ | Unfollow a user |

### Photo Routes (`photoRoute.js`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| GET | `/photos?search=&page=` | No | All photos (search + pagination) |
| POST | `/photos` | ✅ | Upload new photo |
| GET | `/photos/:id` | No | Photo detail |
| PUT | `/photos/:id` | ✅ | Update photo |
| DELETE | `/photos/:id` | ✅ | Delete photo |
| POST | `/photos/:id/comments` | ✅ | Add comment |
| PUT | `/photos/:id/comments/:commentId` | ✅ | Edit existing comment |
| DELETE | `/photos/:id/comments/:commentId` | ✅ | Delete comment |
| POST | `/photos/:id/like` | ✅ | Toggle like |
| POST | `/photos/:id/dislike` | ✅ | Toggle dislike |

### Message Routes (`messagesRoute.js`)
| Method | Path | Auth | Description |
| :--- | :--- | :--- | :--- |
| GET | `/messages` | ✅ | Conversations list |
| GET | `/messages/:id` | ✅ | Chat with user |
| POST | `/messages/:id` | ✅ | Send message |

---

## 7. Project Structure

```text
├── controllers/
│   ├── pageController.js         # Home, about, contact, auth pages
│   ├── photoController.js        # CRUD, comments, likes/dislikes
│   ├── userController.js         # Auth, profile, avatar, bio, follow
│   └── dailyQuestionController.js
├── models/
│   ├── userModel.js              # User schema (avatar, bio, followers)
│   ├── photoModel.js             # Photo schema (comments, likes)
│   └── messageModel.js           # Message schema
├── routes/
│   ├── pageRoute.js              # Public page routes
│   ├── photoRoute.js             # Photo CRUD routes
│   ├── userRoute.js              # User & profile management routes
│   └── messagesRoute.js          # Messaging routes
├── views/
│   ├── partials/
│   │   ├── _header.ejs           # HTML head, meta, CSS imports
│   │   ├── _menu.ejs             # Navigation bar
│   │   └── _footer.ejs           # Footer, JS imports
│   ├── dashboard.ejs             # User dashboard (avatar, bio, photos)
│   ├── user.ejs                  # Public user profile page
│   ├── users.ejs                 # All users listing
│   ├── photo.ejs                 # Photo detail (comments, likes)
│   ├── photos.ejs                # Photo gallery
│   ├── messages.ejs              # Conversations list
│   ├── messageDetail.ejs         # Chat view
│   ├── index.ejs                 # Home page
│   ├── login.ejs / register.ejs  # Auth pages
│   ├── about.ejs / contact.ejs   # Info pages
│   └── ...
├── middlewares/
│   └── authMiddleware.js         # checkUser (global), authenticateToken
├── public/
│   ├── css/
│   │   ├── modern.css            # Main design system (profile styles)
│   │   ├── bootstrap.min.css     # Bootstrap base
│   │   └── ...
│   ├── images/                   # Static images & default avatar
│   └── js/                       # Client-side scripts
├── db.js                         # MongoDB connection (multi-env key support)
├── app.js                        # Express app configuration
├── server.js                     # Entry point (Port listening)
├── vercel.json                   # Vercel deployment config
└── package.json
```

---

## 8. Configuration & Environment
The application requires a `.env` file with the following keys:

```env
# MongoDB
DB_URL=mongodb+srv://...
DB_NAME=sosyal

# Server
PORT=3000

# JWT Authentication
JWT_SECRET=your_secret_key

# Cloudinary (Image Storage)
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret

# Nodemailer (Contact Page)
NODE_MAIL=your_email@gmail.com
NODE_PASS=your_app_password
```

---

## 9. Authentication Flow
1. **Register**: User submits form → password hashed with bcrypt (salt 10) → saved to MongoDB.
2. **Login**: Username/password verified → JWT token created (1 day expiry) → stored as HTTP-only cookie.
3. **checkUser Middleware**: Runs on every request (`app.use('*', checkUser)`) → decodes JWT → sets `res.locals.user`.
4. **authenticateToken Middleware**: Protects routes → redirects to `/login` if no valid token.

---

## 10. Deployment
Configured for deployment on **Vercel** via `vercel.json`, handling serverless functions and asset routing. DB connection includes caching for serverless cold starts.
