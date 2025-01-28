import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

const { Schema } = mongoose;
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username area is required'],
      lowercase: true,
      validate: [validator.isAlphanumeric, 'Only Alphanumeric characters'],
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email area is required'],
      unique: true,
      validate: [validator.isEmail, 'Valid email is required'],
    },
    password: {
      type: String,
      required: [true, 'Password area is required'],
      minLength: [4, 'At least 4 characters'],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', function (next) {
  const user = this;
  console.log("user pass1", user.password);
  bcrypt.hash(user.password, 10, (err, hash) => {
    user.password = hash;
    console.log("user pass2", user.password);
    next();
  });
});

const User = mongoose.model('User', userSchema);
export default User;