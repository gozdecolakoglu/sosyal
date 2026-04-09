# Project "Sosyal" Technical Documentation

## 1. Overview
**Sosyal** is a modern social media platform designed for visual sharing and community interaction. It allows users to upload photos, follow other users, exchange private messages, and share their daily mood. The platform focuses on a clean, responsive user experience with a robust backend to handle real-time social interactions.

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
| **Mailing** | Nodemailer | Email notifications (Reset password, etc.) |
| **Utilities** | validator / dotenv | Data validation and environment config |

---

## 4. Core Features

### 📸 Photo Management
- Multi-column responsive photo grid.
- Photo uploading with descriptions and titles.
- Likes and Dislikes system.
- Commenting functionality on individual photos.

### 👤 User Profiles & Social
- Personalized dashboards.
- Avatar customization (Upload/Delete with History).
- Follow/Unfollow mechanism.
- Followers and Following lists.

### ✉️ Messaging System
- Private one-on-one messaging.
- Real-time conversation view.
- Participant management via `messagesRoute.js`.

### 😊 Mood Tracking (Future)
- Daily mood selection via emojis.
- Community mood statistics tracking.

---

## 5. Data Models (Schema)

### User Model (`userModel.js`)
- `username`: Unique alphanumeric string.
- `email`: Unique validated email.
- `password`: Hashed string.
- `avatar`: Object containing `url` and `public_id`.
- `followers`: Array of User IDs.
- `followings`: Array of User IDs.

### Photo Model (`photoModel.js`)
- `name` & `description`: Strings for metadata.
- `url`: Cloudinary hosted image URL.
- `user`: Reference to the uploader.
- `comments`: Sub-documents containing text, author, and timestamp.
- `likes` / `dislikes`: Arrays of User IDs.

### Message Model (`messageModel.js`)
- `from` / `to`: References to User IDs.
- `text`: Message content.
- `createdAt`: Timestamp.

---

## 6. Project Structure

```text
├── controllers/      # Business logic and request handlers
├── models/           # Mongoose schemas and data structure
├── routes/           # API endpoints and page navigation
├── views/            # EJS templates (partials, layouts, pages)
├── public/           # Static assets (CSS, client-side JS, images)
├── middlewares/      # Auth checks, error handling, file uploads
├── db.js             # Database connection logic
├── app.js            # Express app configuration
└── server.js         # Entry point (Port listening)
```

---

## 7. Configuration & Environment
The application requires a `.env` file with the following keys:
- `DB_URL`: MongoDB connection string.
- `JWT_SECRET`: Secret key for signing tokens.
- `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`: Cloudinary credentials.
- `DB_NAME`: Database name (default: "sosyal").

---

## 8. Deployment
Configured for deployment on **Vercel** via `vercel.json`, handling serverless functions and asset routing.
