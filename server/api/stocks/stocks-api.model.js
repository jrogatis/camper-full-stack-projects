'use strict';

import mongoose from 'mongoose';

var NlSchema = new mongoose.Schema({
  ID: String,
  DESC: String
});

export default mongoose.model('Stocks', NlSchema);
