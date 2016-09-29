'use strict';
import mongoose from 'mongoose';

var BooksSchema = new mongoose.Schema({
  userID: String,
  booksOwned: [{
    googleID: String,
    title: String,
    author: String,
    imgUrl: String
  }],
  pendingTradingRequests: [
    [{bookOfferID: String, bookRequestedID: String, tradeAccepted: Boolean}]
  ],
  pendingTradingOffers: [
    {bookRequestedID: String, bookOfferID: String, tradeAccepted: Boolean}
  ]

});

export default mongoose.model('Books', BooksSchema);
