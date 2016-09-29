/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/books              ->  index
 * POST    /api/books              ->  create
 * GET     /api/books/:id          ->  show
 * PUT     /api/books/:id          ->  upsert
 * PATCH   /api/books/:id          ->  patch
 * DELETE  /api/books/:id          ->  destroy
 * GET     /api/books/user/:id     ->  showByUser
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Books from './books-api.model';

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

export function show(req, res) {
  //console.log('no show', req.params.id);
  return Books.ffindById(req.params.id).exec()
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
  return Books.findOneAndUpdate({"_id" : req.params.id }, req.body, {
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
    console.log('no delete');
    delete req.body._id;
  }
  return Books.findById(req.params.id).exec()
    .then(
        handleEntityNotFound(res)
    )
    .then(

      patchUpdates(req.body)
  )
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

