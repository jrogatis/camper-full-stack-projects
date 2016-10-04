'use strict';

var express = require('express');
var controller = require('./books-api.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/allBooks', controller.showAllBooks);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.post('/bookTrade', controller.requestBookTrade);
router.post('/acceptTrade', controller.acceptBookTrade);
router.put('/:id', controller.upsert);
router.patch('/:id', controller.patch);
router.delete('/:id', controller.destroy);
router.get('/user/:id', controller.showByUser);
router.get('/book/:id', controller.showByBook);


module.exports = router;
