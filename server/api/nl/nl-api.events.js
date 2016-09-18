/**
 * Thing model events
 */

'use strict';

import {EventEmitter} from 'events';
import Nl from './nl-api.model';
var NlEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
NlEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Nl.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    NlEvents.emit(event + ':' + doc._id, doc);
    NlEvents.emit(event, doc);
  };
}

export default NlEvents;
