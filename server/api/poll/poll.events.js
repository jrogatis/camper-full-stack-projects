/**
 * Thing model events
 */

'use strict';

import {EventEmitter} from 'events';
import Poll from './poll.model';
var PollEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
PollEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
for(var e in events) {
  let event = events[e];
  Poll.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    PollEvents.emit(`${event}: ${doc._id}`, doc);
    PollEvents.emit(event, doc);
  };
}

export default PollEvents;
