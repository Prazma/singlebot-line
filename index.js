/*below are the local functions for processing messages*/

const line = require('@line/bot-sdk');
const express = require('express');
var datavase = new Firebase('https://pcboy-8cbb8.firebaseio.com/');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  if(event.message.type != "group") {
    datavase.push({textID:event.message.id,textContent:event.message.text,type:"room",sourceID:event.message.roomId});
  } else {
    datavase.push({textID:event.message.id,textContent:event.message.text,type:"group",sourceID:event.message.groupId});
  }

  // create a echoing text message
  const echo = { type: 'text', text: event.message.text };


  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
