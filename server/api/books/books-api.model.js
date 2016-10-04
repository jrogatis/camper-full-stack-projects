'use strict';
import mongoose from 'mongoose';

var BooksSchema = new mongoose.Schema({
  userID: String,
  userName: String,
  booksOwned: [{
    googleID: String,
    title: String,
    author: String,
    imgUrl: String
  }],
  pendingTradingRequests: [
    { bookOfferID: String, bookRequestedID: String, tradeAccepted: Date}
  ],
  pendingTradingOffers: [
    { bookRequestedID: String, bookOfferID: String, tradeAccepted: Date}
  ]

});

export default mongoose.model('Books', BooksSchema);
