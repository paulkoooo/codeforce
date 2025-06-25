const logger = require('../utils/logger');
const eventQueue = require('../services/eventQueue');

const handleWebhook = async (req, res) => {
  try {
    const event = req.body;
    const eventType = req.headers['x-atlassian-webhook-event'];
    
    logger.info('JIRA webhook received', {
      eventType,
      issueKey: event.issue?.key,
      eventId: event.timestamp
    });

    // Parse JIRA event
    const parsedEvent = parseJiraEvent(event, eventType);
    
    // Add to event queue for processing
    await eventQueue.add('jira-event', {
      type: 'jira',
      eventType,
      data: parsedEvent,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      message: 'JIRA webhook processed successfully',
      eventType,
      issueKey: parsedEvent.issueKey
    });

  } catch (error) {
    logger.error('Error processing JIRA webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
};

const parseJiraEvent = (event, eventType) => {
  const baseEvent = {
    eventType,
    timestamp: event.timestamp,
    user: event.user?.displayName,
    issueKey: event.issue?.key,
    issueId: event.issue?.id,
    projectKey: event.issue?.fields?.project?.key,
    projectName: event.issue?.fields?.project?.name
  };

  switch (eventType) {
    case 'jira:issue_created':
      return {
        ...baseEvent,
        action: 'created',
        issueType: event.issue?.fields?.issuetype?.name,
        summary: event.issue?.fields?.summary,
        description: event.issue?.fields?.description,
        priority: event.issue?.fields?.priority?.name,
        labels: event.issue?.fields?.labels || [],
        assignee: event.issue?.fields?.assignee?.displayName
      };

    case 'jira:issue_updated':
      return {
        ...baseEvent,
        action: 'updated',
        changes: event.changelog?.items || [],
        issueType: event.issue?.fields?.issuetype?.name,
        summary: event.issue?.fields?.summary,
        status: event.issue?.fields?.status?.name,
        priority: event.issue?.fields?.priority?.name,
        labels: event.issue?.fields?.labels || []
      };

    case 'jira:issue_deleted':
      return {
        ...baseEvent,
        action: 'deleted'
      };

    case 'comment_created':
      return {
        ...baseEvent,
        action: 'comment_created',
        commentId: event.comment?.id,
        commentBody: event.comment?.body,
        commentAuthor: event.comment?.author?.displayName
      };

    case 'comment_updated':
      return {
        ...baseEvent,
        action: 'comment_updated',
        commentId: event.comment?.id,
        commentBody: event.comment?.body,
        commentAuthor: event.comment?.author?.displayName
      };

    case 'comment_deleted':
      return {
        ...baseEvent,
        action: 'comment_deleted',
        commentId: event.comment?.id
      };

    default:
      return {
        ...baseEvent,
        action: 'unknown',
        rawEvent: event
      };
  }
};

module.exports = {
  handleWebhook
}; 