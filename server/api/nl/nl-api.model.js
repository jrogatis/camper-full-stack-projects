'use strict';

import mongoose from 'mongoose';

var NlSchema = new mongoose.Schema({
  ID: String,
  UsersGoing: [{
    UserID: String}]
});

export default mongoose.model('Nl', NlSchema);
