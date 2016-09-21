'use strict';

var express = require('express');
var controller = require('./yelp.controller');

var router = express.Router();

router.get('/:setParams', controller.index);

module.exports = router;
