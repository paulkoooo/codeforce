const axios = require('axios');
const logger = require('../utils/logger');

class GitHubService {
  constructor() {
    this.token = process.env.GITHUB_TOKEN;
    this.baseURL = 'https://api.github.com';
    
    if (!this.token) {
      logger.warn('GitHub token not configured');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    });
  }

  // Get repository details
  async getRepository(owner, repo) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}`);
      logger.info(`Retrieved GitHub repository: ${owner}/${repo}`);
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving GitHub repository ${owner}/${repo}:`, error.message);
      throw error;
    }
  }

  // Get pull request details
  async getPullRequest(owner, repo, pullNumber) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/pulls/${pullNumber}`);
      logger.info(`Retrieved GitHub pull request: ${owner}/${repo}#${pullNumber}`);
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving GitHub pull request ${owner}/${repo}#${pullNumber}:`, error.message);
      throw error;
    }
  }

  // Create pull request
  async createPullRequest(owner, repo, pullRequestData) {
    try {
      const response = await this.client.post(`/repos/${owner}/${repo}/pulls`, pullRequestData);
      logger.info(`Created GitHub pull request: ${owner}/${repo}#${response.data.number}`);
      return response.data;
    } catch (error) {
      logger.error(`Error creating GitHub pull request:`, error.message);
      throw error;
    }
  }

  // Update pull request
  async updatePullRequest(owner, repo, pullNumber, updateData) {
    try {
      const response = await this.client.patch(`/repos/${owner}/${repo}/pulls/${pullNumber}`, updateData);
      logger.info(`Updated GitHub pull request: ${owner}/${repo}#${pullNumber}`);
      return response.data;
    } catch (error) {
      logger.error(`Error updating GitHub pull request ${owner}/${repo}#${pullNumber}:`, error.message);
      throw error;
    }
  }

  // Get pull request comments
  async getPullRequestComments(owner, repo, pullNumber) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/pulls/${pullNumber}/comments`);
      logger.info(`Retrieved comments for GitHub pull request: ${owner}/${repo}#${pullNumber}`);
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving comments for GitHub pull request ${owner}/${repo}#${pullNumber}:`, error.message);
      throw error;
    }
  }

  // Add comment to pull request
  async addPullRequestComment(owner, repo, pullNumber, comment) {
    try {
      const response = await this.client.post(`/repos/${owner}/${repo}/pulls/${pullNumber}/comments`, comment);
      logger.info(`Added comment to GitHub pull request: ${owner}/${repo}#${pullNumber}`);
      return response.data;
    } catch (error) {
      logger.error(`Error adding comment to GitHub pull request ${owner}/${repo}#${pullNumber}:`, error.message);
      throw error;
    }
  }

  // Get issue details
  async getIssue(owner, repo, issueNumber) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/issues/${issueNumber}`);
      logger.info(`Retrieved GitHub issue: ${owner}/${repo}#${issueNumber}`);
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving GitHub issue ${owner}/${repo}#${issueNumber}:`, error.message);
      throw error;
    }
  }

  // Create issue
  async createIssue(owner, repo, issueData) {
    try {
      const response = await this.client.post(`/repos/${owner}/${repo}/issues`, issueData);
      logger.info(`Created GitHub issue: ${owner}/${repo}#${response.data.number}`);
      return response.data;
    } catch (error) {
      logger.error(`Error creating GitHub issue:`, error.message);
      throw error;
    }
  }

  // Update issue
  async updateIssue(owner, repo, issueNumber, updateData) {
    try {
      const response = await this.client.patch(`/repos/${owner}/${repo}/issues/${issueNumber}`, updateData);
      logger.info(`Updated GitHub issue: ${owner}/${repo}#${issueNumber}`);
      return response.data;
    } catch (error) {
      logger.error(`Error updating GitHub issue ${owner}/${repo}#${issueNumber}:`, error.message);
      throw error;
    }
  }

  // Add comment to issue
  async addIssueComment(owner, repo, issueNumber, comment) {
    try {
      const response = await this.client.post(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
        body: comment
      });
      logger.info(`Added comment to GitHub issue: ${owner}/${repo}#${issueNumber}`);
      return response.data;
    } catch (error) {
      logger.error(`Error adding comment to GitHub issue ${owner}/${repo}#${issueNumber}:`, error.message);
      throw error;
    }
  }

  // Get repository contents
  async getContents(owner, repo, path, ref = 'main') {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/contents/${path}`, {
        params: { ref }
      });
      logger.info(`Retrieved contents from GitHub repository: ${owner}/${repo}/${path}`);
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving contents from GitHub repository ${owner}/${repo}/${path}:`, error.message);
      throw error;
    }
  }

  // Create or update file
  async createOrUpdateFile(owner, repo, path, content, message, branch = 'main', sha = null) {
    try {
      const fileData = {
        message,
        content: Buffer.from(content).toString('base64'),
        branch
      };

      if (sha) {
        fileData.sha = sha;
      }

      const response = await this.client.put(`/repos/${owner}/${repo}/contents/${path}`, fileData);
      logger.info(`Created/updated file in GitHub repository: ${owner}/${repo}/${path}`);
      return response.data;
    } catch (error) {
      logger.error(`Error creating/updating file in GitHub repository ${owner}/${repo}/${path}:`, error.message);
      throw error;
    }
  }

  // Get repository branches
  async getBranches(owner, repo) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/branches`);
      logger.info(`Retrieved branches from GitHub repository: ${owner}/${repo}`);
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving branches from GitHub repository ${owner}/${repo}:`, error.message);
      throw error;
    }
  }

  // Create branch
  async createBranch(owner, repo, branchName, baseBranch = 'main') {
    try {
      // First get the SHA of the base branch
      const baseBranchData = await this.getBranch(owner, repo, baseBranch);
      
      const branchData = {
        ref: `refs/heads/${branchName}`,
        sha: baseBranchData.commit.sha
      };

      const response = await this.client.post(`/repos/${owner}/${repo}/git/refs`, branchData);
      logger.info(`Created branch in GitHub repository: ${owner}/${repo}/${branchName}`);
      return response.data;
    } catch (error) {
      logger.error(`Error creating branch in GitHub repository ${owner}/${repo}/${branchName}:`, error.message);
      throw error;
    }
  }

  // Get specific branch
  async getBranch(owner, repo, branch) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/branches/${branch}`);
      logger.info(`Retrieved branch from GitHub repository: ${owner}/${repo}/${branch}`);
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving branch from GitHub repository ${owner}/${repo}/${branch}:`, error.message);
      throw error;
    }
  }

  // Get repository commits
  async getCommits(owner, repo, sha = 'main') {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/commits`, {
        params: { sha }
      });
      logger.info(`Retrieved commits from GitHub repository: ${owner}/${repo}`);
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving commits from GitHub repository ${owner}/${repo}:`, error.message);
      throw error;
    }
  }

  // Get commit details
  async getCommit(owner, repo, sha) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/commits/${sha}`);
      logger.info(`Retrieved commit from GitHub repository: ${owner}/${repo}/${sha}`);
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving commit from GitHub repository ${owner}/${repo}/${sha}:`, error.message);
      throw error;
    }
  }
}

module.exports = new GitHubService(); 