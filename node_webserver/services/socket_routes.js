const zeroRpcClient = require('./zerorpc').zeroRpcClient;

function socketHandler(eventType, data, callback) {
   switch (eventType) {
       case "req_parse_tweets":
           return req_parse_tweets(eventType, data, callback);
           break;
       default:
           return std_response(eventType, data);
   }
}

function std_response(eventType, data) {
    console.log(`Client sent event: ${eventType}, with data: ${data}`);
    let response = `Hello ${data.name}!`;
    return response;
}

function req_parse_tweets(eventType, data, callback) {
    console.log(`Client sent event: ${eventType}`);
    zeroRpcClient.invoke("req_parse_tweets", data, function(error, res) {
        callback(res);
    });
}


exports.socketHandler = socketHandler;
