var weatherMatrix = [
    [-3.0, -0.8, -0.5, -1.0],
    [-4.0, -0.9, -0.7, -2.0],
    [-0.5, 1.4, -0.5, 0.0],
    [3.0, 5.3, 6.5, 4.0],
    [8.0, 10.6, 9.5, 7.0],
    [10.0, 14.4, 13.5, 12.0],
    [15.0, 16.5, 18.5, 16.0],
    [14.0, 15.8, 20.5, 19.0],
    [9.0, 11.6, 13.8, 12.0],
    [5.6, 7.6, 8.8, 6.0],
    [3.1, 6.0, 5.8, 5.2],
    [-0.8, 0.4, -0.5, 0.0]
]

var chaos = -1,
    alarm = false,
    timeStamp = '';

function setLastMsg(ts){
    timeStamp = ts;
}

function getLastMsg(ts){
    return timeStamp;
}
function randTemp() {
    var now = new Date();
    var month = now.getUTCMonth();
    var hour = now.getUTCHours();

    // normalize hour of the day into 4 periods
    if (hour < 6)
        hour = 0;
    else if (hour > 5 && hour < 12)
        hour = 1;
    else if (hour > 11 && hour < 18)
        hour = 2;
    else if (hour > 17 && hour < 24)
        hour = 3;

    var sed = random(0, 2);
    var seed = random(-sed, sed);
    var temp = weatherMatrix[month][hour] + seed;

    return { temp, seed };
}

function startChaos() {
    chaos = Math.trunc(random(0, 4));
    console.log('<UTILS> STARTTING CHAOS ON TURBINE: ' + chaos)
    return chaos;
}

function getChaos() {
    return chaos;
}

function getAlarm() {
    return alarm;
}

function setAlarm(alm) {
    alarm = alm;
}

function resetChaos() {
    console.log('stopped chaos on device: ' + chaos);
    chaos = -1;
    return chaos;
}

function random(low, high) {
    return Math.random() * (high - low) + low;
}

module.exports.randTemp = randTemp;
module.exports.random = random;
module.exports.chaos = chaos;
module.exports.getChaos = getChaos;

module.exports.resetChaos = resetChaos;
module.exports.startChaos = startChaos;

module.exports.getAlarm = getAlarm;
module.exports.setAlarm = setAlarm;

module.exports.getLastMsg = getLastMsg;
module.exports.setLastMsg = setLastMsg;


