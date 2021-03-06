'use strict';

import mongoose from 'mongoose';

var PintSchema = new mongoose.Schema({
  ownerId: String,
  imgUrl: String,
  desc: String,
  date: { type: Date, default: Date.now },
  likes: [{
    userId: String
  }]
});

export default mongoose.model('Pint', PintSchema);
