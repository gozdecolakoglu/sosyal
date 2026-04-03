import mongoose from 'mongoose';
let cachedConnectionPromise = null;

const DB_ENV_KEYS = ['DB_URL', 'MONGODB_URI', 'MONGO_URI', 'DATABASE_URL', 'MONGODB_URL'];

const sanitizeUri = (value = '') => value.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');

const getDatabaseUri = () => {
  for (const key of DB_ENV_KEYS) {
    const raw = process.env[key];
    if (raw && raw.trim()) {
      return { key, uri: sanitizeUri(raw) };
    }
  }
  return { key: null, uri: '' };
};

const conn = async () => {
  const { key: usedKey, uri: dbUri } = getDatabaseUri();

  if (!dbUri) {
    throw new Error(`Missing DB connection string. Set one of: ${DB_ENV_KEYS.join(', ')}`);
  }

  if (!/^mongodb(\+srv)?:\/\//.test(dbUri)) {
    throw new Error(`Invalid Mongo URI in ${usedKey}. It must start with mongodb:// or mongodb+srv://`);
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!cachedConnectionPromise) {
    const connectOptions = {
      serverSelectionTimeoutMS: 10000,
      ...(process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {}),
    };

    cachedConnectionPromise = mongoose
      .connect(dbUri, connectOptions)
      .then((mongooseInstance) => {
        console.log(`Connected to MongoDB successfully via ${usedKey}`);
        return mongooseInstance.connection;
      })
      .catch((err) => {
        cachedConnectionPromise = null;
        throw err;
      });
  }

  return cachedConnectionPromise;
};
export default conn;