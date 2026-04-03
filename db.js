import mongoose from 'mongoose';
let cachedConnectionPromise = null;

const getDatabaseUri = () => {
  return process.env.DB_URL || process.env.MONGODB_URI || process.env.MONGO_URI || '';
};

const conn = async () => {
  const dbUri = getDatabaseUri();

  if (!dbUri) {
    throw new Error('Missing DB connection string. Set DB_URL, MONGODB_URI, or MONGO_URI.');
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!cachedConnectionPromise) {
    cachedConnectionPromise = mongoose
      .connect(dbUri, process.env.DB_NAME ? { dbName: process.env.DB_NAME } : {})
      .then((mongooseInstance) => {
        console.log('Connected to the DB succesully');
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