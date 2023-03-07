import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const CacheSchema = new Schema({
  updatedAt: {
    type: Date,
    default: Date.now,
    expires: 24 * 60 * 60 // 1 day
  },
  key: {
    type: String,
    unique: true,
    require: true
  },
  data: {
    type: Schema.Types.Mixed
  }
}, {
  strict: true,
  strictQuery: false
});

CacheSchema.set('toJSON', {
  virtuals: true,
  getters: true,
  transform (doc, ret) {
    delete ret._id;
    delete ret[CacheSchema.options.versionKey];
    delete ret[CacheSchema.options.discriminatorKey];
    return ret;
  }
});

const Cache = mongoose.model('Cache', CacheSchema);

export default Cache;
