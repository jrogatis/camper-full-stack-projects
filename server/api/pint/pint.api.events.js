/**
 * Pint model events
 */

'use strict';

import {EventEmitter} from 'events';
import Pint from './pint.api.model';
var PintEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
PintEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Pint.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    PintEvents.emit(`${event}: ${doc._id}`, doc);
    PintEvents.emit(event, doc);
  };
}

export default PintEvents;
