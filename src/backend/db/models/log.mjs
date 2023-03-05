import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const LogSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  ip: {
    type: String
  },
  useragent: {
    type: String
  },
  method: {
    type: String
  },
  url: {
    type: String
  },
  statusCode: {
    type: Number
  },
  statusMessage: {
    type: String
  },
  duration: {
    type: Number
  },
  size: {
    type: Number
  }
});

LogSchema.set('toJSON', {
  virtuals: true,
  getters: true,
  transform (doc, ret) {
    delete ret._id;
    delete ret[LogSchema.options.versionKey];
    delete ret[LogSchema.options.discriminatorKey];
    return ret;
  }
});

const Log = mongoose.model('Log', LogSchema);

export default Log;
