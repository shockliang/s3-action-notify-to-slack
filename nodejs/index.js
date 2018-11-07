const monent = require('moment-timezone');
const request = require('request');

exports.handler = (event, context, callback) => {
    // If timezone empty that will using default ISO time to display.
    var timezone = process.env.TIMEZONE;
    var objectType = process.env.OBJECT_TYPE == '' ? "Backup" : process.env.OBJECT_TYPE;
    var objectKey = event.Records[0].s3.object.key;
    var objectSize = Number((event.Records[0].s3.object.size / 1024).toFixed(2));
    var objectUnit = "KB";
    
    if(objectSize > 1024) {
        objectSize = Number((objectSize / 1024).toFixed(2));
        objectUnit = "MB";
    }
    
    var eventTime = monent
        .tz(event.Records[0].eventTime, timezone)
        .format("YYYY/MM/DD HH:mm:ss SSS");
    var bucket = event.Records[0].s3.bucket.name;
    var attachmentTitle = `New ${objectType.toLowerCase()} uploaded! :tada:`;
    var messageTitle = `${objectType} to bucket - bucket`;
    var messageLevel = "good";
    var filedValueContext = objectKey + " has been uploaded to bucket successfully on " + eventTime + "\n file size: " + objectSize + " " + objectUnit
    
    var actions = event.Records[0].eventName.split(':');
    var action = actions[0];
    var reason = actions[1];
    
    if(action === 'ObjectRemoved') {
        if(reason === 'Delete') {
            attachmentTitle = `Old ${objectType.toLowerCase()} has been deleted!`;
        } else if (reason === 'DeleteMarkerCreated') {
            attachmentTitle = `${objectType} has been deleted by manually!`;
        } else {
            attachmentTitle = "Reason: " + reason; 
        }
        
        messageTitle = `Delete ${objectType.toLowerCase()} form bucket ${bucket}`;
        messageLevel = "warning";
        filedValueContext = objectKey + " has been deleted from bucket on " + eventTime + " cause " + reason;
    }
    
    var attachments = {
       "attachments":[
          {
             "fallback": attachmentTitle,
             "pretext": attachmentTitle,
             "color": messageLevel,
             "fields":[
                {
                   "title": messageTitle,
                   "value": filedValueContext,
                   "short": false
                }
             ]
          }
       ]
    };

    var options = {
        uri: process.env.SLACK_WEBHOOK_URI,
        method: 'POST',
        json: attachments
    };

    request.post(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body.id) // Print the shortened url.
          console.log("body: " + body);
          console.log("Post to slack error: " + error)
        }
    });
    
    console.log(event);
    console.log(event.Records[0]);
    
    callback(null, messageTitle + ' Object Key:' + objectKey);
};
