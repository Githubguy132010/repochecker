<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# RepoChecker GitHub App

This is a GitHub App developed using Probot that analyzes repositories and creates issues with AI-powered suggestions. The app uses OpenAI's API to analyze repository contents and generate improvement suggestions.

## Key Components

- `index.js`: Core application logic for handling GitHub events and repository analysis
- `server.js`: Entry point for running the Probot server
- Environment variables for configuration of GitHub App and OpenAI API

## Important APIs and Patterns

- Probot framework for handling GitHub webhook events
- OpenAI API for generating AI-powered suggestions
- GitHub's Octokit library for interacting with GitHub's API
- Event-driven architecture with handlers for repository creation and push events