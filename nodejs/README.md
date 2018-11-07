# S3 action notify to slack of NodeJs version #
* This creating lambda via SAM was inspired by [symphoniacloud/code-pipeline-slack-notifier](https://github.com/symphoniacloud/code-pipeline-slack-notifier). The main idea was creating lambda function can be repeatable and automatic that using `AWS CloudFormation`. But a fly on the ointment was can not binding **exist** s3 bucket cause CloudFormation does not support the feature. 

How to solve this problem?
* Manaual binding created lambda function to exist s3 bucket.
* Binding SNS service to exist s3 bucket and pick up message from sns topic to invoked lambda function.

[AWS serverless issue #124 ref](https://github.com/awslabs/serverless-application-model/issues/124)

[AWS Serverless Application Model(SAM) docs](https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#s3)

## Prerequisites ##
* AWS S3 bucket.
* Slack incoming webhook url.[**incoming webhook**](https://api.slack.com/incoming-webhooks)
* Node install in locally.
* Aws cli.

## Setup ##
1. Run the following from a terminal, substituting:
    * `YOUR_S3_BUCKET` for the S3 bucket described above.
    * `YOUR-INCOMING-WEBHOOK-URL` for the Slack URL described above.
    * `YOUR_OBJECT_TYPE` for substituting slack message content. e.g., Backup or Artifact 
    * `YOUR_TIMEZONE` for slack message receiver timezone.
        * Using [IANA Time Zone Format](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) 
            * E.g. America/New_York or Asia/Taipei

```bash
# restore package
$ npm install

# package index.js and node_modules to zip file.
$ npm run dist

# Upload packaged zip to YOUR_S3_BUCKET and generate stack yaml file.
$ aws cloudformation package --template-file sam.yml --s3-bucket YOUR_S3_BUCKET --output-template-file target/packaged-template.yaml

# Deploy lambda function stack to aws with slack webhook url and timezone.
$ aws cloudformation deploy --template-file ./target/packaged-template.yaml --stack-name s3-action-slack-notifier --parameter-overrides SlackUrl=YOUR-INCOMING-WEBHOOK-URL ObjectType=YOUR_OBJECT_TYPE Timezone=YOUR_TIMEZONE --capabilities CAPABILITY_IAM
```

## Teardown ##
```bash
$ aws cloudformation delete-stack --stack-name s3-action-slack-notifier
```