import { WebClient, LogLevel } from "@slack/web-api";


var template = [
  {
    "type": "header",
    "text": {
      "type": "plain_text",
      "text": ":harness: Harness Account Activity :harness:"
    }
  },
  {
    "type": "context",
    "elements": [
      {
        "type": "mrkdwn",
        "text": "In the past 1 hour, the following activity occurred in Account abcd1234 (ABC Company)."
      }
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*NEW PIPELINE EXECUTIONS*"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": ":no_entry_sign: *konr@company.com* executed the `my app build` pipeline and it failed 2 times"
    },
    "accessory": {
      "type": "button",
      "text": {
        "type": "plain_text",
        "text": "View Executions",
        "emoji": true
      }
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": ":warning: *konr@company.com* executed the `my app build` pipeline and it failed 2 times and succeeded 3 times"
    },
    "accessory": {
      "type": "button",
      "text": {
        "type": "plain_text",
        "text": "View Executions",
        "emoji": true
      }
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": ":white_check_mark: *konr@company.com* executed the `my app deploy` pipeline successfully 3 times"
    },
    "accessory": {
      "type": "button",
      "text": {
        "type": "plain_text",
        "text": "View Executions",
        "emoji": true
      }
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*NEW ACCOUNT ACTIVITY*"
    },
    "accessory": {
      "type": "button",
      "text": {
        "type": "plain_text",
        "text": "View Audit Trail",
        "emoji": true
      },
      "value": "click_me_123",
      "url": "https://app.harness.io",
      "action_id": "button-action"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": ":bust_in_silhouette: *konr@company.com* logged in"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": ":gear: *konr@company.com* created the `test_1` variable"
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "context",
    "elements": [
      {
        "type": "mrkdwn",
        "text": ":pushpin: To change these notifications, say */account-notifications config*."
      }
    ]
  }
];

// WebClient instantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
const client = new WebClient(process.env.SLACK_OAUTH_TOKEN, {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.DEBUG
});
// Find conversation ID using the conversations.list method
async function findConversation(name) {
  try {
    // Call the conversations.list method using the built-in WebClient
    const result = await client.conversations.list({
      // The token you used to initialize your app
      token: process.env.SLACK_OAUTH_TOKEN
    });

    for (const channel of result.channels) {
      if (channel.name === name) {
        var channelId = channel.id;

        // Print result
        console.log("Found channel ID: " + channelId);
        // Break from for loop
        break;
      }
    }

    try {
      // Call the chat.postMessage method using the WebClient
      const result = await client.chat.postMessage({
        channel: channelId,
        text: ":harness: Harness Account Activity :harness:",
        blocks: template
      });

      console.log(result);
    }
    catch (error) {
      console.error(error);
    }
  }
  catch (error) {
    console.error(error);
  }
}

// Find conversation with a specified channel `name`
findConversation("harness-slack-app");

