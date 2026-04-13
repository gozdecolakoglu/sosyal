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
    avatar: {
      url: {
        type: String,
        default: "/images/profile_1.jpg"
      },
      public_id: String
    },
    bio: {
      type: String,
      maxLength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
      trim: true,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    followings: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

const User = mongoose.model('User', userSchema);
export default User;