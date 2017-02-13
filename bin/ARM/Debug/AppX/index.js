"use strict";
var express = require('express');
var router = express.Router();
var utils = require('../lib/utils');
var dateFormat = require('dateformat');
var turbineArray = require('../config/turbine-short.json').payload;




/* GET home page. */
router.get('/', function (req, res) {
    console.log('turbine array: ' + turbineArray.length);
    var ts = dateFormat(utils.getLastMsg(), "longTime", true)
    res.render('index', { title: 'PI GW 003', timeStamp: ts, ta: turbineArray.length });
});

module.exports = router;