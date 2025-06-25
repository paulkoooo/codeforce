const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const jiraWebhookController = require('../controllers/jiraWebhookController');
const githubWebhookController = require('../controllers/githubWebhookController');
const { validateJiraWebhook, validateGitHubWebhook } = require('../middleware/webhookValidation');

// JIRA webhook endpoints
router.post('/jira', validateJiraWebhook, jiraWebhookController.handleWebhook);

// GitHub webhook endpoints
router.post('/github', validateGitHubWebhook, githubWebhookController.handleWebhook);

// Webhook test endpoint
router.post('/test', (req, res) => {
  logger.info('Test webhook received', {
    body: req.body,
    headers: req.headers
  });
  
  res.json({
    message: 'Test webhook received successfully',
    timestamp: new Date().toISOString(),
    data: req.body
  });
});

module.exports = router; 