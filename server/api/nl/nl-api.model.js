'use strict';

import mongoose from 'mongoose';

var NlSchema = new mongoose.Schema({
  ID: String,
  usersGoing: [{
    userID: String}]
});

export default mongoose.model('Nl', NlSchema);
