# serverless-ws

# Architecture
- API Gateway websockets
- Lambda
- DynamoDB

# Deployment
- `aws-vault exec <profile> --` - access AWS profile
- `make bootstrap` - bootstrap cdk infra
- `make deploy` - deploy cdk infra
- `sls deploy` - deploy serverless functions

# Usage
  
 - `npm i -g wscat` - to install WebSocket cat

- `wscat -c wss://{ApiId}.execute-api.us-east-1.amazonaws.com/{ApiStage}` - connect

- `{"action": "sendMessage", "name": "johndoe", "channelId": "General", "content": "hello world!"}` - send message

- `{"action": "subscribeChannel", "channelId": "Secret"}` `{"action": "unsubscribeChannel", "channelId": "Secret"}` - channel subscriptions
