/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/stocks              ->  index
 * POST     /api/stocks/quotes       ->  showQuotes
 * POST    /api/stocks              ->  create
 * GET     /api/stocks/:id          ->  show
 * PUT     /api/stocks/:id          ->  upsert
 * PATCH   /api/stocks/:id          ->  patch
 * DELETE  /api/stocks/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import Stocks from './stocks-api.model';
import _ from 'lodash';
import rp from 'request-promise';
import moment from 'moment';
import S from 'string';
const dateFormats = ['YYYY-MM-DD', 'MM/DD/YYYY'];


function camelize(text) {
  return S(text)
    .slugify()
    .camelize()
    .s;
}

function toFloat(value, valueForNaN) {
  var result = parseFloat(value);
  if(isNaN(result)) {
    if(_.isUndefined(valueForNaN)) {
      return null;
    } else {
      return valueForNaN;
    }
  } else {
    return result;
  }
}

function toInt(value, valueForNaN) {
  var result = parseInt(value, 10);
  if(isNaN(result)) {
    if(_.isUndefined(valueForNaN)) {
      return null;
    } else {
      return valueForNaN;
    }
  } else {
    return result;
  }
}

function transformHistorical(symbol, data) {
  var headings = data.shift();
  return _(data)
    .reverse()
    .map(function(line) {
      var result = {};
      headings.forEach(function(heading, i) {
        var value = line[i];
        if(_.includes(['Volume'], heading)) {
          value = toInt(value, null);
        } else if (_.includes(['Open', 'High', 'Low', 'Close', 'Adj Close', 'Dividends'], heading)) {
          value = toFloat(value, null);
        } else if(_.includes(['Date'], heading)) {
          value = value
        }
        result[camelize(heading)] = value;
      });
      result.symbol = symbol;
      return result;
    })
    .value();
}

function parseCSV(text) {
  return S(text).trim().s.split('\n').map(function (line) {
    return S(line).trim().parseCSV();
  });
}

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

// Gets a list of stocks
export function index(req, res) {
  return Stocks.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function showQuotes(req, res) {
  let values = req.body;
  const url = 'http://chart.finance.yahoo.com/table.csv?s=';
  values.from = moment(values.from);
  values.to = moment(values.to);
  const qsa = {
    s: values.symbol,
    a: values.from.format('MM') - 1,
    b: values.from.format('DD'),
    c: values.from.format('YYYY'),
    d: values.to.format('MM') - 1,
    e: values.to.format('DD'),
    f: values.to.format('YYYY'),
    g: 'd',
    ignore: '.csv'
  };

  rp({uri: url, qs: qsa})
    .then (ret => parseCSV(ret))
    .then(data => transformHistorical(values.symbol, data))
    .then(respondWithResult(res))
    .catch(handleError(res));

}

export function show(req, res) {
  //console.log('no show', req.params.id);
  return Stocks.findOne({
    ID: req.params.id
  }).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new stock Symbol in the DB
export function create(req, res) {
  return Stocks.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given stock in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Stocks.findOneAndUpdate(req.params.id, req.body, {
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true
  }).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing nl in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Stocks.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a nl from the DB
export function destroy(req, res) {
  return Stocks.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}


