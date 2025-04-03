# RepoChecker

A GitHub App that analyzes repositories and creates issues with AI-powered suggestions for improvements using Google's Gemini API.

## Features

- Automatically analyzes repository contents when:
  - A repository is created
  - Code is pushed to the default branch
- Uses Google's Gemini API to generate tailored suggestions for improving:
  - Code architecture
  - Best practices
  - Security vulnerabilities
  - Code organization
- Creates GitHub issues containing the suggestions

## Setup

### Prerequisites

- Node.js (v14 or newer)
- npm
- GitHub account
- Google Gemini API key

### Installation

1. Clone this repository:
```bash
git clone https://github.com/your-username/repochecker.git
cd repochecker
```

2. Install dependencies:
```bash
npm install
```

3. Copy the example environment variables file:
```bash
cp .env.example .env
```

4. Register a new GitHub App:
   - Go to your GitHub account settings
   - Select "Developer settings" > "GitHub Apps" > "New GitHub App"
   - Fill in the required fields:
     - Name: RepoChecker
     - Homepage URL: (Your GitHub profile or repository URL)
     - Webhook URL: (Use a service like Smee.io for development)
     - Permissions needed:
       - Repository contents: Read
       - Issues: Write
     - Subscribe to events:
       - Repository
       - Push

5. After creating the app, you'll get:
   - An App ID
   - A Webhook Secret
   - You'll need to generate a Private Key

6. Get your Google Gemini API key:
   - Go to https://aistudio.google.com/app/apikey
   - Create an API key
   - Add it to your `.env` file

7. Update your `.env` file with all these values.

### Running Locally

For development, you can use a tool like [Smee.io](https://smee.io/) to forward webhook payloads to your local machine:

```bash
npm install -g smee-client
smee --url https://smee.io/your-smee-url --target http://localhost:3000/api/github/webhooks
```

Then start the app:

```bash
npm start
```

### Deployment

For production deployment, consider hosting on:
- Heroku
- Vercel
- AWS Lambda
- GitHub Actions

## How It Works

1. The app listens for repository events (creation or push to default branch)
2. When triggered, it:
   - Fetches repository files (focusing on code files, ignoring binaries)
   - Sends the code to Google's Gemini Pro model for analysis
   - Creates a new issue in the repository with the AI's suggestions

## Configuration

You can adjust the app's behavior by modifying:
- The number of files analyzed (currently limited to 10)
- The maximum file size considered (currently 100KB)
- The AI model used (currently Gemini Pro)
- The AI prompt to focus on specific aspects of code review

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.