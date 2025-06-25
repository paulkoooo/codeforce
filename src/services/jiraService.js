const axios = require('axios');
const logger = require('../utils/logger');

class JiraService {
  constructor() {
    this.baseURL = process.env.JIRA_BASE_URL;
    this.username = process.env.JIRA_USERNAME;
    this.apiToken = process.env.JIRA_API_TOKEN;
    
    if (!this.baseURL || !this.username || !this.apiToken) {
      logger.warn('JIRA credentials not fully configured');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      auth: {
        username: this.username,
        password: this.apiToken
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  // Get issue details
  async getIssue(issueKey) {
    try {
      const response = await this.client.get(`/rest/api/3/issue/${issueKey}`);
      logger.info(`Retrieved JIRA issue: ${issueKey}`);
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving JIRA issue ${issueKey}:`, error.message);
      throw error;
    }
  }

  // Update issue
  async updateIssue(issueKey, updateData) {
    try {
      const response = await this.client.put(`/rest/api/3/issue/${issueKey}`, updateData);
      logger.info(`Updated JIRA issue: ${issueKey}`);
      return response.data;
    } catch (error) {
      logger.error(`Error updating JIRA issue ${issueKey}:`, error.message);
      throw error;
    }
  }

  // Add comment to issue
  async addComment(issueKey, comment) {
    try {
      const commentData = {
        body: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: comment
                }
              ]
            }
          ]
        }
      };

      const response = await this.client.post(`/rest/api/3/issue/${issueKey}/comment`, commentData);
      logger.info(`Added comment to JIRA issue: ${issueKey}`);
      return response.data;
    } catch (error) {
      logger.error(`Error adding comment to JIRA issue ${issueKey}:`, error.message);
      throw error;
    }
  }

  // Transition issue status
  async transitionIssue(issueKey, transitionId) {
    try {
      const transitionData = {
        transition: {
          id: transitionId
        }
      };

      const response = await this.client.post(`/rest/api/3/issue/${issueKey}/transitions`, transitionData);
      logger.info(`Transitioned JIRA issue ${issueKey} to transition ${transitionId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error transitioning JIRA issue ${issueKey}:`, error.message);
      throw error;
    }
  }

  // Get available transitions for an issue
  async getTransitions(issueKey) {
    try {
      const response = await this.client.get(`/rest/api/3/issue/${issueKey}/transitions`);
      logger.info(`Retrieved transitions for JIRA issue: ${issueKey}`);
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving transitions for JIRA issue ${issueKey}:`, error.message);
      throw error;
    }
  }

  // Search issues using JQL
  async searchIssues(jql, maxResults = 50) {
    try {
      const searchData = {
        jql,
        maxResults,
        fields: ['summary', 'status', 'assignee', 'priority', 'labels', 'description']
      };

      const response = await this.client.post('/rest/api/3/search', searchData);
      logger.info(`Searched JIRA issues with JQL: ${jql}`);
      return response.data;
    } catch (error) {
      logger.error(`Error searching JIRA issues:`, error.message);
      throw error;
    }
  }

  // Get project details
  async getProject(projectKey) {
    try {
      const response = await this.client.get(`/rest/api/3/project/${projectKey}`);
      logger.info(`Retrieved JIRA project: ${projectKey}`);
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving JIRA project ${projectKey}:`, error.message);
      throw error;
    }
  }

  // Get project components
  async getProjectComponents(projectKey) {
    try {
      const response = await this.client.get(`/rest/api/3/project/${projectKey}/components`);
      logger.info(`Retrieved components for JIRA project: ${projectKey}`);
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving components for JIRA project ${projectKey}:`, error.message);
      throw error;
    }
  }

  // Create issue
  async createIssue(issueData) {
    try {
      const response = await this.client.post('/rest/api/3/issue', issueData);
      logger.info(`Created JIRA issue: ${response.data.key}`);
      return response.data;
    } catch (error) {
      logger.error(`Error creating JIRA issue:`, error.message);
      throw error;
    }
  }

  // Link issues
  async linkIssues(linkData) {
    try {
      const response = await this.client.post('/rest/api/3/issueLink', linkData);
      logger.info(`Linked JIRA issues: ${linkData.inwardIssue.key} -> ${linkData.outwardIssue.key}`);
      return response.data;
    } catch (error) {
      logger.error(`Error linking JIRA issues:`, error.message);
      throw error;
    }
  }

  // Get issue watchers
  async getIssueWatchers(issueKey) {
    try {
      const response = await this.client.get(`/rest/api/3/issue/${issueKey}/watchers`);
      logger.info(`Retrieved watchers for JIRA issue: ${issueKey}`);
      return response.data;
    } catch (error) {
      logger.error(`Error retrieving watchers for JIRA issue ${issueKey}:`, error.message);
      throw error;
    }
  }

  // Add watcher to issue
  async addWatcher(issueKey, username) {
    try {
      const response = await this.client.post(`/rest/api/3/issue/${issueKey}/watchers`, username);
      logger.info(`Added watcher ${username} to JIRA issue: ${issueKey}`);
      return response.data;
    } catch (error) {
      logger.error(`Error adding watcher to JIRA issue ${issueKey}:`, error.message);
      throw error;
    }
  }
}

module.exports = new JiraService(); 