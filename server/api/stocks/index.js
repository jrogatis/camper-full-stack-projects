'use strict';

var express = require('express');
var controller = require('./stocks-api.controller');

var router = express.Router();

router.get('/', controller.index);
router.post('/quotes', controller.showQuotes);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);


module.exports = router;
