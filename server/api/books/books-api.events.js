/**
 * Thing model events
 */

'use strict';

import {EventEmitter} from 'events';
import Books from './books-api.model';
var BooksEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
BooksEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  BooksEvents.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    BooksEvents.emit(`${event}: ${doc._id}`, doc);
    BooksEvents.emit(event, doc);
  };
}

export default BooksEvents;
