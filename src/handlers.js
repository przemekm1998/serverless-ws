const db = require("./db");
const ws = require("./client");
const sanitize = require("sanitize-html");


const wsClient = new ws.Client();


const success = {
  statusCode: 200
};


async function connect(event, context) {
  await wsClient._setupClient(event);
  await subscribeChannel({
    ...event,
    body: JSON.stringify({
      channelId: "General"
    })
  }, context);

  return success;
}


async function disconnect(event, context) {
  const subscriptions = await db.fetchConnectionSubscriptions(event);
  const unsubscribes = subscriptions.map(async subscription => {
    unsubscribeChannel({
      ...event,
      body: JSON.stringify({
        action: "unsubscribe",
        channelId: db.parseEntityId(subscription[db.Channel.Primary.Key])
      })
    }, context);
  });

  await Promise.all(unsubscribes);

  return success;
}


async function sendMessage(event, context) {
  const body = JSON.parse(event.body);
  const messageId = `${db.Message.Prefix}${Date.now()}`;

  const name = body.name
    .replace(/[^a-z0-9\s-]/gi, "")
    .trim()
    .replace(/\+s/g, "-");
  const content = sanitize(body.content, {
    allowedTags: ["ul", "ol", "b", "i", "em", "strike", "pre", "strong", "li"],
    allowedAttributes: {}
  });

  const item = await db.Client.put({
    TableName: db.Table,
    Item: {
      [db.Message.Primary.Key]: `${db.Channel.Prefix}${body.channelId}`,
      [db.Message.Primary.Range]: messageId,
      ConnectionId: `${event.requestContext.connectionId}`,
      Name: name,
      Content: content
    }
  }).promise();

  const subscribers = await db.fetchChannelSubscriptions(body.channelId);
  const results = subscribers.map(async subscriber => {
    const subscriberId = db.parseEntityId(subscriber[db.Channel.Connections.Range]);
    return wsClient.send(subscriberId, {
      event: "channel_message",
      channelId: body.channelId,
      name,
      content
    })
  });

  await Promise.all(results);

  return success;
}


async function subscribeChannel(event, context) {
  const channelId = JSON.parse(event.body).channelId;
  await db.Client.put({
    TableName: db.Table,
    Item: {
      [db.Channel.Connections.Key]: `${db.Channel.Prefix}${channelId}`,
      [db.Channel.Connections.Range]: `${db.Connection.Prefix}${db.parseEntityId(event)}`
    }
  }).promise();

  // Instead of broadcasting here we listen to the dynamodb stream
  // just a fun example of flexible usage
  // you could imagine bots or other sub systems broadcasting via a write the db
  // and then streams does the rest
  return success;
}


async function unsubscribeChannel(event, context) {
  const channelId = JSON.parse(event.body).channelId;
  const item = await db.Client.delete({
    TableName: db.Table,
    Key: {
      [db.Channel.Connections.Key]: `${db.Channel.Prefix}${channelId}`,
      [db.Channel.Connections.Range]: `${db.Connection.Prefix}${
        db.parseEntityId(event)
      }`
    }
  }).promise();

  return success;
}

module.exports = {
  sendMessage,
  connect,
  subscribeChannel,
  unsubscribeChannel,
  disconnect
};