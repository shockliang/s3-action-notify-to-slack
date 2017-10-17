var request = require('request');

exports.handler = (event, context, callback) => {
    var options = {
        uri: 'https://hooks.slack.com/services/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',
        method: 'POST',
        json: {
          "channel": "#gitlab-events",
          "text":"test form shock"
        }
    };

    request.post(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body.id) // Print the shortened url.
        }
    });
    

    var objectKey = event.Records[0].s3.object.key;
    console.log(objectKey);
    callback(null, 'Hello from Lambda! Object Key:' + objectKey);
};