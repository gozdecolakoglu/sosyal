import mongoose from 'mongoose';

const { Schema } = mongoose;

const photoSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  url: {
    type: String,
    required: true,
  },
  image_id: {
    type: String,
  },
  comments: [{
    text: {
      type: String,
      required: true
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const Photo = mongoose.model('Photo', photoSchema);

export default Photo;