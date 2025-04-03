const { createNodeMiddleware, createProbot } = require('probot');
const http = require('http');
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

// Create a Probot instance
const probot = createProbot({
  defaults: {
    webhookPath: '/api/github/webhooks',
    webhookProxy: process.env.WEBHOOK_PROXY_URL
  }
});

// Create the middleware for GitHub webhooks
const middleware = createNodeMiddleware(app, { probot });

// Start the server
const port = process.env.PORT || 3000;

// Create the server with custom request handling
const server = http.createServer((req, res) => {
  // Handle the root path with basic app information
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>RepoChecker GitHub App</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 2rem;
            }
            .container { 
              border: 1px solid #e1e4e8;
              border-radius: 6px;
              padding: 2rem;
              margin-top: 2rem;
            }
            h1 { 
              border-bottom: 1px solid #eaecef;
              padding-bottom: .3em;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>RepoChecker GitHub App</h1>
            <p>This is a GitHub App that analyzes repositories and creates issues with AI-powered suggestions.</p>
            <h2>Status</h2>
            <p>✅ Server is running!</p>
            <p>The webhook endpoint is available at: <code>/api/github/webhooks</code></p>
            <h2>How It Works</h2>
            <ol>
              <li>The app listens for repository events (creation or push to default branch)</li>
              <li>When triggered, it fetches repository files (focusing on code files, ignoring binaries)</li>
              <li>Sends the code to Google's Gemini Pro model for analysis</li>
              <li>Creates a new issue in the repository with the AI's suggestions</li>
            </ol>
            <p>For more information, please refer to the <a href="https://github.com/your-username/repochecker">documentation</a>.</p>
          </div>
        </body>
      </html>
    `);
    return;
  }
  
  // Forward all other requests to the Probot middleware
  middleware(req, res);
});

server.listen(port, () => {
  console.log(`RepoChecker is running on port ${port}!`);
  console.log(`- Webhook endpoint: http://localhost:${port}/api/github/webhooks`);
  console.log(`- Root page: http://localhost:${port}/`);
});