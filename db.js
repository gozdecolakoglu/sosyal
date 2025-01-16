import mongoose from 'mongoose';
const conn = () => {
  mongoose
    .connect(process.env.DB_URL, {
      dbName: 'sosyal',
/*       useNewUrlParser: true,
      useUnifiedTopology: true, */
    })
    .then(() => {
      console.log('Connected to the DB succesully');
    })
    .catch((err) => {
      console.log(`DB connection err: ${err}`);
    });
};
export default conn;