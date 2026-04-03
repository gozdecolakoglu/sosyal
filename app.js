import express from "express";
import dotenv from "dotenv";
import conn from "./db.js";
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import path from 'path';
import { fileURLToPath } from 'url';
import pageRoute from './routes/pageRoute.js';
import photoRoute from './routes/photoRoute.js';
import userRoute from './routes/userRoute.js';
import { checkUser } from './middlewares/authMiddleware.js';
import fileUpload from 'express-fileupload';
import { v2 as cloudinary } from 'cloudinary';
import messageRoute from './routes/messagesRoute.js';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//ejs template engine
app.set("view engine", 'ejs');
app.set('views', path.join(__dirname, 'views'));

//static files middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true }));
app.use(
    methodOverride('_method', {
      methods: ['POST', 'GET'],
    })
  );

// Ensure DB is connected per invocation in serverless.
app.use(async (req, res, next) => {
  try {
    await conn();
    return next();
  } catch (error) {
    console.error('DB connection error:', error.message);
    return res.status(500).send('Database connection failed. Check Vercel env vars.');
  }
});

/* app.get("/", (req, res) => {
    res.render("index");
});
app.get("/about", (req, res) => {
    res.render("about");
}); */
//routes
app.use('*', checkUser);
app.use('/', pageRoute);
app.use('/photos', photoRoute);
app.use('/users', userRoute);
app.use('/messages', messageRoute);

app.use((err, req, res, next) => {
  console.error('Unhandled app error:', err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(500).send('Internal server error');
});

export default app;