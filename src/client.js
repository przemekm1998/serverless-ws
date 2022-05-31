const AWS = require("aws-sdk");
const db = require("./db")


class Client {
  constructor(config) {
    this.client;
    if (config) {
      this._setupClient(config);
    }
  }

  async _setupClient(config) {
    if (typeof config !== 'object' && !this.client) {
      const item = await db.Client.get({
        TableName: db.TableName,
        Key: {
          [db.Primary.Key]: 'APPLICATION',
          [db.Primary.Range]: 'WS_CONFIG'
        }
      }).promise();

      console.log(item);
      config = item.Item;
      config.fromDb = true;
    }

    if (!this.client) {
      if (config.requestContext.apiId) {
        config.requestContext.domainName = `${config.requestContext.apiId}.execute-api.${process.env.API_REGION}.amazonaws.com`
      }

      this.client = new AWS.ApiGatewayManagementApi({
        apiVersion: "2022-05-11",
        endpoint: `https://${config.requestContext.domainName}/${config.requestContext.stage}`
      })

      if (config.fromDb !== true) {
        await db.Client.put({
          TableName: db.Table,
          Item: {
            [db.Primary.Key]: 'APPLICATION',
            [db.Primary.Range]: 'WS_CONFIG',
            requestContext: {
              domainName: config.requestContext.domainName,
              stage: config.requestContext.stage
            }
          }
        }).promise()
      }
    }
  }

  async send(connection, payload) {
    await this._setupClient(connection);

    let ConnectionId = connection;
    if (typeof connection === 'object') {
      ConnectionId = connection.requestContext.connectionId;
    }

    console.log(connection, payload);

    await this.client.postToConnection({
      ConnectionId,
      Data: JSON.stringify(payload)
    }).promise().catch(async err => {
      console.log(JSON.stringify(err));

      if (err.statusCode === 410) {
        const subscriptions = await db.fetchConnectionSubscriptions(ConnectionId);

        console.log(`[wsClient][send][postToConnection] Found stale connection, deleting ${ConnectionId}:`);
        console.log('[wsClient][send][postToConnection] Unsubscribe from channels:');
        console.log(JSON.stringify(subscriptions, null, 2));

        const unsubscribes = subscriptions.map(async subscription => {
          db.Client.delete({
            TableName: db.Table,
            Key: {
              [db.Channel.Connections.Key]: `${db.Channel.Prefix}${db.parseEntityId(subscription[db.Channel.Primary.Key])}`,
              [db.Channel.Connections.Range]: `${db.Connection.Prefix}${ConnectionId}`
            }
          }).promise()
        });

        await Promise.all(unsubscribes);
      }
    })

    return true
  }
}

module.exports = {
  Client
}