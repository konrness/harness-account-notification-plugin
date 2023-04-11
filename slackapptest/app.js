// Require the Bolt package (github.com/slackapi/bolt)
const { App, LogLevel } = require("@slack/bolt");
const process = require('process')

const app = new App({
  token: process.env.SLACK_OAUTH_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.DEBUG
});

process.on('SIGINT', () => {
  console.info("Interrupted")
  process.exit(0)
});


//Add code here

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');

  app.event('app_home_opened', ({ event, say }) => {  
    console.log(event);

    say(`Hello world, <@${event.user}>!`);
  });

  app.command('/harness-notifier', async ({ ack, body, client, logger }) => {
    // Acknowledge command request
    await ack();
  
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'config',
        title: {
          type: 'plain_text',
          text: 'Modal title'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Welcome to a modal with _blocks_'
            },
            accessory: {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Click me!'
              },
              action_id: 'button_abc'
            }
          },
          {
            type: 'input',
            block_id: 'input_c',
            label: {
              type: 'plain_text',
              text: 'What are your hopes and dreams?'
            },
            element: {
              type: 'plain_text_input',
              action_id: 'dreamy_input',
              multiline: true
            }
          }
        ],
        submit: {
          type: 'plain_text',
          text: 'Submit'
        }
      }
    });

    console.log("result", result);

  });

  app.view('config', async ({ ack, body, view, client, logger }) => {
    // Acknowledge the view_submission request
    await ack({
      response_action: 'update',
      view: {
        type: 'modal',
        // View identifier
        callback_id: 'view_1',
        title: {
          type: 'plain_text',
          text: 'Updated modal'
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: 'You updated the modal!'
            }
          },
          {
            type: 'image',
            image_url: 'https://media.giphy.com/media/SVZGEcYt7brkFUyU90/giphy.gif',
            alt_text: 'Yay! The modal was updated'
          }
        ]
      }
    });
  
    // Do whatever you want with the input data - here we're saving it to a DB then sending the user a verification of their submission
  
    // Assume there's an input block with `block_1` as the block_id and `input_a`
    console.log("view", view);
    const val = view['state']['values']['input_c']['dreamy_input']['value'];
    const user = body['user']['id'];

    console.log("Config update: ", val, user);
  
    msg = 'Your submission was successful';
  
    // Message the user
    try {
      await client.chat.postMessage({
        channel: user,
        text: msg
      });
    }
    catch (error) {
      logger.error(error);
    }
  
  });
  
  

})();
