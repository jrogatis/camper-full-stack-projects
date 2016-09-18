/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/nl              ->  index
 * POST    /api/nl              ->  create
 * GET     /api/nl/:id          ->  show
 * PUT     /api/nl/:id          ->  upsert
 * PATCH   /api/nl/:id          ->  patch
 * DELETE  /api/nl/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Nl from './nl-api.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return entity => {
     console.log("no respondWithResult do nl", entity)
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
    }
  };
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

// Gets a list of nl
export function index(req, res) {
  return Nl.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single nl from the DB
export function show(req, res) {
  return Nl.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new nl in the DB
export function create(req, res) {
  return Nl.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given nl in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Nl.findOneAndUpdate(req.params.id, req.body, {upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing nl in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Nl.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a nl from the DB
export function destroy(req, res) {
  return Nl.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
