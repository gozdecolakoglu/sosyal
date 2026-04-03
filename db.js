import mongoose from 'mongoose';
let cachedConnectionPromise = null;

const conn = async () => {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is missing');
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!cachedConnectionPromise) {
    cachedConnectionPromise = mongoose
      .connect(process.env.DB_URL, {
        dbName: 'sosyal',
      })
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