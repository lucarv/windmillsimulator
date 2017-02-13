var express = require('express');
var router = express.Router();
var utils = require('../lib/utils');

var querystring = require('querystring');
var turbineArray = require('../config/turbine-short.json').payload;

var Protocol = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;

var csArray = require('../config/device.json').connStr;
var timer = 30,
    started = false,
    msgType = 'short',
    timeStamp = '';

/* ------------------------------------------------------
* 
* initialize iot hub clients
*
------------------------------------------------------ */
var clientArray = [];
for (i = 0; i < csArray.length; i++) {
    var client = Client.fromConnectionString(csArray[i], Protocol);
    clientArray.push(client);
}


/* ------------------------------------------------------
* 
* compose a message with random values for
* windSpeed, ActivePower, Production, GeneratorRPM
* Temperature (ambient and nacelle)
*
* change wind direction
* set alarm flag if needed
------------------------------------------------------ */
var composeMessage = function (index) {
    var now = new Date();
    var dice = Math.floor(Math.random() * 5);

    // simulate a drastic change in wind direction randomly
    if (dice === (now.getUTCMinutes() % 6)) {
        newWD = Number(turbineArray[index].WindDirection) + utils.random(-7, 7);
        turbineArray[index].WindDirection = String(newWD);
        //console.log('<TELEMETRY> CHANGING WIND DIRECTION ON TURBINE: ' + index);
        //console.log('<TELEMETRY> NEW WIND DIRECTION: ' + newWD);
    }

    // randomize variation of windSpeed and
    // ActivePower, Production, GeneratorRPM 
    var delta = utils.random(-20, 20) / 100;
    var ws = Number(turbineArray[index].WindSpeed);
    ws += ws * delta;
    var ap = Number(turbineArray[index].ActivePower);
    ap += ap * delta;
    var prod = Number(turbineArray[index].Production);
    prod += prod * delta;
    var grpm = Number(turbineArray[index].GeneratorRPM);
    grpm += grpm * delta;
    turbineArray[index].WindSpeed = String(ws);
    turbineArray[index].ActivePower = String(ap);
    turbineArray[index].Production = String(prod);
    turbineArray[index].GeneratorRPM = String(grpm);

    // variate temperatures
    // (ambient and nacelle)
    randSeed = utils.randTemp()
    turbineArray[index].AmbTemp = randSeed.temp;
    var nta = Number(turbineArray[index].NacelTmpAvg);
    nta += randSeed.seed;
    turbineArray[index].NacelTmpAvg = String(nta.toFixed(3));

    turbineArray[index].Time = now;

    if (turbineArray[index].TurbineStatus === "1") {
        if (!utils.getAlarm()) {
            utils.setAlarm(true);
        }
    }

    var message = JSON.stringify(turbineArray[index]);
    return message;
};


/* ------------------------------------------------------
* 
*   ROUTING
*
------------------------------------------------------ */

/* ------------------------------------------------------
*
* show gateway status, 
* timeStamp of last sent message,
* message frequency 
* what device is malfunctioning (-1 if all are ok)
*
------------------------------------------------------ */

router.get('/', function (req, res, next) {
    var ts = utils.getLastMsg();
    console.log('<TELE>: ' + ts)
    res.status(200).send(
        {
            "status": started,
            "timestamp": ts,
            "chaos": utils.getChaos(),
            "frequency": timer
        });
});

/* ------------------------------------------------------
* 
* change gateway url
*
------------------------------------------------------ */
router.post('/', function (req, res, next) {
    timer = req.body.timer;
    msgType = req.body.msgType;

    res.status(200).send('updated');
});

/* ------------------------------------------------------
* 
* start telemetry
*
------------------------------------------------------ */
router.post('/start', function (req, res, next) {
    if (!started) {
        started = true;

        var timerCB = function (err) {
            if (err) {
                console.log(err);
            }
            else {
                var sendInterval = setInterval(function () {
                    if (started) {
                        for (i = 0; i < turbineArray.length; i++) {

                            if (i === utils.getChaos() && utils.getAlarm())
                                console.log('<TELEMETRY> skipping faulty turbine: ' + i);
                            else {
                                var data = composeMessage(i);
                                var message = new Message(data);
                                client = clientArray[i];
                                client.sendEvent(message);
                                console.log('<TELEMETRY> message sent from turbine: ' + i);
                            }
                        }
                        timeStamp = Date.now()
                        utils.setLastMsg(timeStamp);

                    }
                    else {
                        clearInterval(sendInterval);
                        for (i = 0; i < turbineArray.length; i++) {
                            client = clientArray[i];
                            //client.removeAllListeners();
                            client.close();
                            delete client;
                        }
                    }
                }, (timer * 1000));
            }
        }

        client.open(timerCB);
        res.status(200).send({
            "status": started,
            "timestamp": timeStamp,
            "chaos": utils.getChaos()
        });
    }
    else
        res.status(400).send('already started')
});

/* ------------------------------------------------------
* 
* stop telemetry
*
------------------------------------------------------ */
router.post('/stop', function (req, res, next) {
    if (started) {
        started = false;
        res.status(200).send('stopped');
    }
    else
        res.status(400).send('no telemetry running');
});

module.exports = router;
