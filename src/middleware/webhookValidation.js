const crypto = require('crypto');
const logger = require('../utils/logger');

// JIRA webhook validation
const validateJiraWebhook = (req, res, next) => {
  try {
    const signature = req.headers['x-hub-signature'];
    const webhookSecret = process.env.JIRA_WEBHOOK_SECRET;
    
    if (!signature || !webhookSecret) {
      logger.warn('JIRA webhook validation failed: missing signature or secret');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // JIRA uses HMAC SHA256 for webhook signatures
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex')}`;

    if (signature !== expectedSignature) {
      logger.warn('JIRA webhook validation failed: invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    logger.info('JIRA webhook validation successful');
    next();
  } catch (error) {
    logger.error('JIRA webhook validation error:', error);
    res.status(500).json({ error: 'Validation error' });
  }
};

// GitHub webhook validation
const validateGitHubWebhook = (req, res, next) => {
  try {
    const signature = req.headers['x-hub-signature-256'];
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    
    if (!signature || !webhookSecret) {
      logger.warn('GitHub webhook validation failed: missing signature or secret');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // GitHub uses HMAC SHA256 for webhook signatures
    const expectedSignature = `sha256=${crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex')}`;

    if (signature !== expectedSignature) {
      logger.warn('GitHub webhook validation failed: invalid signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    logger.info('GitHub webhook validation successful');
    next();
  } catch (error) {
    logger.error('GitHub webhook validation error:', error);
    res.status(500).json({ error: 'Validation error' });
  }
};

module.exports = {
  validateJiraWebhook,
  validateGitHubWebhook
}; 