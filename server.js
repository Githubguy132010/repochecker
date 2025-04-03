const { Probot } = require('probot');
const app = require('./index');

// Load environment variables
require('dotenv').config();

// Webhook secret is required for verifying webhook signatures
if (!process.env.WEBHOOK_SECRET) {
  console.warn('No webhook secret defined. This may cause issues with webhook verification.');
}

// App ID is required for authenticating as a GitHub App
if (!process.env.APP_ID) {
  console.error('No App ID defined. Please set the APP_ID environment variable.');
  process.exit(1);
}

// Private key is required for authenticating as a GitHub App
if (!process.env.PRIVATE_KEY && !process.env.PRIVATE_KEY_PATH) {
  console.error('No private key defined. Please set either PRIVATE_KEY or PRIVATE_KEY_PATH environment variable.');
  process.exit(1);
}

// Start the server
Probot.run(app, {
  port: process.env.PORT || 3000,
  webhookProxy: process.env.WEBHOOK_PROXY_URL
}).then(() => {
  console.log('RepoChecker is running!');
});