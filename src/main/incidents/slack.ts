import config = require('config');

const { App } = require('@slack/bolt');

export const app = new App({
  signingSecret: config.get('secrets.response.slack-signing-secret'),
  token: config.get('secrets.response.slack-bot-token'),
});
