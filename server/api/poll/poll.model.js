'use strict';

import mongoose from 'mongoose';

var PollSchema = new mongoose.Schema({
  name: String,
  owner: String,
  items: [{
    item: String,
    votes: Number}]
});

export default mongoose.model('Poll', PollSchema);
