/**
 * RepoChecker - A GitHub App that analyzes repositories and creates issues with AI-powered suggestions
 */
require('dotenv').config();
const { Probot } = require('probot');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  app.log.info("RepoChecker GitHub App started!");

  // Listen for repository events
  app.on('repository.created', async (context) => {
    await analyzeRepository(context);
  });

  app.on('push', async (context) => {
    // Only analyze on pushes to the default branch
    const defaultBranch = context.payload.repository.default_branch;
    const ref = context.payload.ref;

    if (ref === `refs/heads/${defaultBranch}`) {
      await analyzeRepository(context);
    }
  });

  // Analyze repositories and create issues with AI suggestions
  async function analyzeRepository(context) {
    const repo = context.payload.repository;
    app.log.info(`Analyzing repository: ${repo.full_name}`);

    try {
      // Get repository contents to analyze
      const files = await getRepositoryFiles(context);
      
      // Get AI-powered suggestions
      const suggestions = await generateSuggestions(files, repo);
      
      // Create issue with suggestions
      await createIssueWithSuggestions(context, suggestions, repo);
      
    } catch (error) {
      app.log.error(`Error analyzing repository ${repo.full_name}: ${error.message}`);
    }
  }

  // Get files from the repository to analyze
  async function getRepositoryFiles(context) {
    const repo = context.payload.repository;
    const owner = repo.owner.login;
    const repoName = repo.name;
    const fileData = [];

    // Get the file tree
    const result = await context.octokit.git.getTree({
      owner,
      repo: repoName,
      tree_sha: repo.default_branch,
      recursive: 1
    });

    // Filter for actual files (not directories)
    const files = result.data.tree.filter(item => item.type === 'blob');
    
    // Limit to a reasonable number of files to analyze
    const filesToAnalyze = files.slice(0, 10);
    
    // Get content for each file (with size limits)
    for (const file of filesToAnalyze) {
      try {
        // Skip large files and binary files
        if (file.size > 100000 || isBinaryPath(file.path)) continue;
        
        const content = await context.octokit.repos.getContent({
          owner,
          repo: repoName,
          path: file.path,
          ref: repo.default_branch
        });
        
        // Only include content if we can get it as text
        if (content.data.encoding === 'base64') {
          const buffer = Buffer.from(content.data.content, 'base64');
          fileData.push({
            path: file.path,
            content: buffer.toString('utf8')
          });
        }
      } catch (error) {
        app.log.warn(`Could not get content for ${file.path}: ${error.message}`);
      }
    }
    
    return fileData;
  }

  // Helper function to check if a file is likely binary
  function isBinaryPath(path) {
    const binaryExtensions = ['.jpg', '.png', '.gif', '.mp4', '.zip', '.pdf'];
    return binaryExtensions.some(ext => path.toLowerCase().endsWith(ext));
  }

  // Generate suggestions using Google Gemini API
  async function generateSuggestions(files, repo) {
    app.log.info(`Generating suggestions for repository: ${repo.full_name}`);
    
    // Create a comprehensive repository overview for AI analysis
    const repoOverview = {
      name: repo.full_name,
      description: repo.description || "No description provided",
      files: files.map(file => ({
        path: file.path,
        // Trim content if it's too large for the AI to process
        content: file.content.length > 5000 ? file.content.substring(0, 5000) + '...' : file.content
      }))
    };
    
    try {
      // Get the Gemini Pro model
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `
You are an expert code reviewer and software architect. Analyze the repository files and provide helpful, actionable suggestions for improvement.
Focus on architecture, best practices, security issues, and code organization. Provide specific examples where possible.

Repository information:
- Name: ${repoOverview.name}
- Description: ${repoOverview.description}

Files to analyze:
${repoOverview.files.map(file => `
File path: ${file.path}
Content:
\`\`\`
${file.content}
\`\`\`
`).join('\n')}

Please provide a comprehensive analysis with specific improvement suggestions.
`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text;
    } catch (error) {
      app.log.error(`Error generating AI suggestions: ${error.message}`);
      return "Could not generate suggestions due to an error. Please check the logs.";
    }
  }

  // Create GitHub issue with the suggestions
  async function createIssueWithSuggestions(context, suggestions, repo) {
    app.log.info(`Creating issue with suggestions for repository: ${repo.full_name}`);
    
    const issueTitle = "AI-powered Repository Suggestions";
    const issueBody = `
# Repository Analysis Suggestions

Our AI assistant has analyzed your repository and came up with these suggestions:

${suggestions}

---
*This issue was automatically created by RepoChecker, an AI-powered GitHub App using Google's Gemini API.*
*If you found this helpful, consider starring the [RepoChecker](https://github.com/your-username/repochecker) repository.*
    `;
    
    try {
      await context.octokit.issues.create({
        owner: repo.owner.login,
        repo: repo.name,
        title: issueTitle,
        body: issueBody,
        labels: ['enhancement', 'ai-suggestion']
      });
      
      app.log.info(`Successfully created issue in ${repo.full_name}`);
    } catch (error) {
      app.log.error(`Error creating issue: ${error.message}`);
    }
  }
};