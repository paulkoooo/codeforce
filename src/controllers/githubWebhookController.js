const logger = require('../utils/logger');
const eventQueue = require('../services/eventQueue');

const handleWebhook = async (req, res) => {
  try {
    const event = req.body;
    const eventType = req.headers['x-github-event'];
    
    logger.info('GitHub webhook received', {
      eventType,
      repository: event.repository?.full_name,
      sender: event.sender?.login
    });

    // Parse GitHub event
    const parsedEvent = parseGitHubEvent(event, eventType);
    
    // Add to event queue for processing
    await eventQueue.add('github-event', {
      type: 'github',
      eventType,
      data: parsedEvent,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({
      message: 'GitHub webhook processed successfully',
      eventType,
      repository: parsedEvent.repository
    });

  } catch (error) {
    logger.error('Error processing GitHub webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
};

const parseGitHubEvent = (event, eventType) => {
  const baseEvent = {
    eventType,
    timestamp: new Date().toISOString(),
    sender: event.sender?.login,
    repository: event.repository?.full_name,
    repositoryId: event.repository?.id
  };

  switch (eventType) {
    case 'push':
      return {
        ...baseEvent,
        action: 'push',
        ref: event.ref,
        before: event.before,
        after: event.after,
        commits: event.commits?.map(commit => ({
          id: commit.id,
          message: commit.message,
          author: commit.author?.name,
          timestamp: commit.timestamp
        })) || [],
        branch: event.ref.replace('refs/heads/', '')
      };

    case 'pull_request':
      return {
        ...baseEvent,
        action: event.action, // opened, closed, reopened, etc.
        pullRequest: {
          id: event.pull_request?.id,
          number: event.pull_request?.number,
          title: event.pull_request?.title,
          body: event.pull_request?.body,
          state: event.pull_request?.state,
          user: event.pull_request?.user?.login,
          assignees: event.pull_request?.assignees?.map(a => a.login) || [],
          labels: event.pull_request?.labels?.map(l => l.name) || [],
          head: {
            ref: event.pull_request?.head?.ref,
            sha: event.pull_request?.head?.sha
          },
          base: {
            ref: event.pull_request?.base?.ref,
            sha: event.pull_request?.base?.sha
          },
          draft: event.pull_request?.draft,
          merged: event.pull_request?.merged,
          mergeable: event.pull_request?.mergeable
        }
      };

    case 'pull_request_review':
      return {
        ...baseEvent,
        action: 'review',
        review: {
          id: event.review?.id,
          state: event.review?.state, // approved, changes_requested, commented
          user: event.review?.user?.login,
          body: event.review?.body,
          submittedAt: event.review?.submitted_at
        },
        pullRequest: {
          number: event.pull_request?.number,
          title: event.pull_request?.title
        }
      };

    case 'pull_request_review_comment':
      return {
        ...baseEvent,
        action: 'review_comment',
        comment: {
          id: event.comment?.id,
          body: event.comment?.body,
          user: event.comment?.user?.login,
          path: event.comment?.path,
          line: event.comment?.line,
          position: event.comment?.position
        },
        pullRequest: {
          number: event.pull_request?.number,
          title: event.pull_request?.title
        }
      };

    case 'issues':
      return {
        ...baseEvent,
        action: event.action, // opened, closed, reopened, etc.
        issue: {
          id: event.issue?.id,
          number: event.issue?.number,
          title: event.issue?.title,
          body: event.issue?.body,
          state: event.issue?.state,
          user: event.issue?.user?.login,
          assignees: event.issue?.assignees?.map(a => a.login) || [],
          labels: event.issue?.labels?.map(l => l.name) || [],
          milestone: event.issue?.milestone?.title
        }
      };

    case 'issue_comment':
      return {
        ...baseEvent,
        action: event.action, // created, edited, deleted
        comment: {
          id: event.comment?.id,
          body: event.comment?.body,
          user: event.comment?.user?.login,
          createdAt: event.comment?.created_at,
          updatedAt: event.comment?.updated_at
        },
        issue: {
          number: event.issue?.number,
          title: event.issue?.title
        }
      };

    case 'create':
      return {
        ...baseEvent,
        action: 'create',
        refType: event.ref_type, // tag or branch
        ref: event.ref,
        description: event.description
      };

    case 'delete':
      return {
        ...baseEvent,
        action: 'delete',
        refType: event.ref_type, // tag or branch
        ref: event.ref
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