var rest = require('restler');
var jf = require('jsonfile');
var util = require('./util');

var ltaCredFile = './private/lta_credentials.json';
var ltaCredentials = jf.readFileSync(ltaCredFile);

var busStops = [19059, 19051, 17099, 17091];
var defaultBusStop = 19059;

var busStopUrl =
    'http://datamall2.mytransport.sg/ltaodataservice/BusArrival?BusStopID=';

var busStopHeaders = {
    'AccountKey': ltaCredentials.AccountKey,
    'UniqueUserID': ltaCredentials.UniqueUserID
};

function busStop(id, callback) {
    if (callback === undefined) {
        callback = console.log;
    }
    var reqUrl = busStopUrl + id.toString();
    var reqOptions = {
        'headers': busStopHeaders
    };
    var response = send(reqUrl, reqOptions, callback);
    return response;
}

function send(reqUrl, reqOptions, callback) {
    return rest.get(reqUrl, reqOptions).on('complete', function(data) {
        processInfo(data, callback);
    });
}

function processInfo(data, callback) {
    var busTimingsList;
    var header;
    data.Services.forEach(function(bus) {
        if (bus.Status === 'In Operation') {
            var nextBusTime = new Date(bus.NextBus.EstimatedArrival);
            var subseqBusTime = new Date(bus.SubsequentBus.EstimatedArrival);
            busTimingsList = bus.ServiceNo + ' - ' +
                util.timeLeftMin(nextBusTime) + ', ' +
                util.timeLeftMin(subseqBusTime);
        }
    });
    header = (busTimingsList) ? "Buses in operation: \n" : "Go walk home 😜.\n"
    busTimingsList = (busTimingsList) ? busTimingsList : "";
    callback(header + busTimingsList);
}

module.exports = {
    'busStopQuery': busStop,
    'defaultBusStop': defaultBusStop
};
