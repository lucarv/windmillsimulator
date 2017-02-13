"use strict";

var express = require('express');
var router = express.Router();
var utils = require('../lib/utils');
var telemetry = require('./tele');
var csArray = require('../config/device.json').connStr;
var turbineArray = require('../config/turbine-short.json').payload;

var chaos = -1,
  chaosTemp;

/* ------------------------------------------------------
* 
*   ROUTING
*
------------------------------------------------------ */

router.post('/chaos', function (req, res, next) {
    if (utils.getChaos() === -1) {
        chaos = utils.startChaos();
        chaosTemp = Number(turbineArray[chaos].GearOilTemp);
        //console.log('<DEVICE> SAVING PREVIOUS OIL TEMP: ' + chaosTemp);

        var got = chaosTemp + 15;
        turbineArray[chaos].GearOilTemp = String(got);
        turbineArray[chaos].TurbineStatus = "1";

        res.status(200).send(chaos.toString());

    }
    else
        res.status(400).send('can only chaos one device at a time');

});

router.post('/reset', function (req, res, next) {
    if (utils.getChaos() !== -1) {

        //console.log('<DEVICE> RECOVERING PREVIOUS OIL TEMP: ' + chaosTemp);
        turbineArray[chaos].GearOilTemp = String(chaosTemp);
        turbineArray[chaos].TurbineStatus = "0";

        chaos = utils.resetChaos();
        utils.setAlarm(false);
        res.sendStatus(200);
    }
    else
        res.status(400).send('no malfunctioning unit');
});

router.get('/:id', function (req, res, next) {
    idx = req.params.id;
    res.status(200).send(turbineArray[idx]);
});

router.get('/', function (req, res, next) {
    res.status(200).send(turbineArray);
});

router.put('/', function (req, res, next) {
    /*
    idx = req.body.deviceId;
    
      if (req.body.temperature !== undefined)
        devices[idx].temperature = Number(req.body.temperature);
    
      if (req.body.humidity !== undefined)
        devices[idx].humidity = Number(req.body.humidity);
    
      // save new values to disk for next run
      jsonfile.writeFile(filename, config, function (err) {
        if (err)
          console.error(err);
        else
          console.log('wrote config: ' + config);
    
      })
    */
    res.sendStatus(501);

});

router.post('/', function (req, res, next) {
    res.sendStatus(501);
});

module.exports.turbineArray = turbineArray;
module.exports.chaos = chaos;
module.exports = router;
module.exports = router;