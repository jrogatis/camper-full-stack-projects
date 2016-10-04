/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/books              ->  index
 * POST    /api/books              ->  create
 * GET     /api/books/:id          ->  show
 * PUT     /api/books/:id          ->  upsert
 * PATCH   /api/books/:id          ->  patch
 * DELETE  /api/books/:id          ->  destroy
 * GET     /api/books/user/:id     ->  showByUser
 * GET     /api/books/book/:id     ->  showByBook
 * POST    /api/books/bookTrade/:IdOfferBook/:idRequestBook  ->  doBookTrade
 * POST    /api/books/acceptBookTrade/:IdOffer ->  acceptBookTrade
 * GET     /api/books/allBooks/:id    ->  showAllBooks
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Books from './books-api.model';
import _ from 'lodash';
//import ObjectId from 'mongoose';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return entity => {
    //console.log('no respond', entity);
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches);
    } catch(err) {
      return Promise.reject(err);
    }
    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(function() {
          return res.status(204).end();
        });
    }};
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function handleTradeOffer(bookIds) {
  // console.log('bookIds', bookIds);
  return function (entity) {
    //console.log('entity', JSON.stringify(entity));
    // a litle meesie but you set a offer on the request book owner
    // and vice versa
    const offerToAdd = {
      bookRequestedID: bookIds.bookToRequestID,
      bookOfferID: bookIds.bookToOfferID,
      tradeAccepted: ''
    };
    const requestToAdd = {
      bookRequestedID: bookIds.bookToRequestID,
      bookOfferID: bookIds.bookToOfferID,
      tradeAccepted: ''
    };


    //now i need to know what of this 2 entities have the book
    // is the onwer of the transaction so he recive the request register
    entity.map((ent, index) => {
      ent.booksOwned.map(book => {
        if(book._id.toString() === bookIds.bookToOfferID) {
          entity[index].pendingTradingRequests.push(requestToAdd);
          entity[index].save()
        } else if(book._id.toString() === bookIds.bookToRequestID) {
          entity[index].pendingTradingOffers.push(offerToAdd);
          entity[index].save()
        }
      })
    })

    return entity
  };
}


function handleBookOfferAceptance(aceptedOfferID) {
  return function (entity) {
    console.log(entity, 'aceptedOfferID', aceptedOfferID)
    //alter the current entity so
    // acept the offer then delete the ownership for the book
    // then

  }
}

// Gets a list of Books
export function index(req, res) {
  return Books.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function showByUser(req, res) {
  //console.log('no show', req.params.id);
  return Books.findOne({
    userID: req.params.id
  }).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function showByBook(req, res) {
  return Books.findOne({
    'booksOwned._id': req.params.id
  }, 'userID booksOwned.title booksOwned.imgUrl booksOwned._id'  ).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function requestBookTrade(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  //find the user that is offering that book
  //console.log(req.body);
  return Books.find({
      $or: [{
        'booksOwned._id': req.body.bookToOfferID
    }, {
        'booksOwned._id': req.body.bookToRequestID
      }]
    }).exec()
    .then(handleEntityNotFound(res))
    .then(handleTradeOffer(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function acceptBookTrade(req, res) {
  console.log('acceptBookTrade', req.body)
  return Books.findOne({
      'pendingTradingOffers._id': req.body.pendingTradingOffers
    }).exec()
    .then(handleEntityNotFound(res))
    .then(handleBookOfferAceptance(req.body))
}


export function showAllBooks(req, res) {
   return Books.find({},'userID booksOwned')
    .exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));

}

export function show(req, res) {
  return Books.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new book in the DB
export function create(req, res) {
  return Books.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given book in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Books.findOneAndUpdate({_id: req.params.id }, req.body, {
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true
  }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing book in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Books.findOne({userID: req.params.id}).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a book from the DB
export function destroy(req, res) {
  return Books.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}


