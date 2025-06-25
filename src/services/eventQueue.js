const Queue = require('bull');
const logger = require('../utils/logger');

// Create Redis connection
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create queues
const jiraEventQueue = new Queue('jira-events', redisUrl);
const githubEventQueue = new Queue('github-events', redisUrl);
const workflowQueue = new Queue('workflow-events', redisUrl);

// Queue event handlers
jiraEventQueue.on('completed', (job, result) => {
  logger.info('JIRA event processed successfully', {
    jobId: job.id,
    eventType: job.data.eventType,
    issueKey: job.data.data.issueKey
  });
});

jiraEventQueue.on('failed', (job, err) => {
  logger.error('JIRA event processing failed', {
    jobId: job.id,
    error: err.message,
    eventType: job.data.eventType
  });
});

githubEventQueue.on('completed', (job, result) => {
  logger.info('GitHub event processed successfully', {
    jobId: job.id,
    eventType: job.data.eventType,
    repository: job.data.data.repository
  });
});

githubEventQueue.on('failed', (job, err) => {
  logger.error('GitHub event processing failed', {
    jobId: job.id,
    error: err.message,
    eventType: job.data.eventType
  });
});

workflowQueue.on('completed', (job, result) => {
  logger.info('Workflow event processed successfully', {
    jobId: job.id,
    workflowType: job.data.workflowType
  });
});

workflowQueue.on('failed', (job, err) => {
  logger.error('Workflow event processing failed', {
    jobId: job.id,
    error: err.message,
    workflowType: job.data.workflowType
  });
});

// Process JIRA events
jiraEventQueue.process(async (job) => {
  const { type, eventType, data, timestamp } = job.data;
  
  logger.info('Processing JIRA event', {
    eventType,
    issueKey: data.issueKey,
    action: data.action
  });

  // TODO: Implement AI workflow processing
  // This is where we'll integrate with LangGraph and AI agents
  
  return {
    processed: true,
    eventType,
    issueKey: data.issueKey,
    timestamp
  };
});

// Process GitHub events
githubEventQueue.process(async (job) => {
  const { type, eventType, data, timestamp } = job.data;
  
  logger.info('Processing GitHub event', {
    eventType,
    repository: data.repository,
    action: data.action
  });

  // TODO: Implement AI workflow processing
  // This is where we'll integrate with LangGraph and AI agents
  
  return {
    processed: true,
    eventType,
    repository: data.repository,
    timestamp
  };
});

// Process workflow events
workflowQueue.process(async (job) => {
  const { workflowType, data, timestamp } = job.data;
  
  logger.info('Processing workflow event', {
    workflowType,
    data
  });

  // TODO: Implement specific workflow processing
  // This will handle the actual AI-driven workflows
  
  return {
    processed: true,
    workflowType,
    timestamp
  };
});

// Add event to appropriate queue
const add = async (queueName, data) => {
  try {
    let queue;
    
    switch (queueName) {
      case 'jira-event':
        queue = jiraEventQueue;
        break;
      case 'github-event':
        queue = githubEventQueue;
        break;
      case 'workflow-event':
        queue = workflowQueue;
        break;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }

    const job = await queue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: 100,
      removeOnFail: 50
    });

    logger.info(`Event added to queue: ${queueName}`, {
      jobId: job.id,
      eventType: data.eventType || data.workflowType
    });

    return job;
  } catch (error) {
    logger.error('Error adding event to queue:', error);
    throw error;
  }
};

// Get queue statistics
const getStats = async () => {
  try {
    const [jiraStats, githubStats, workflowStats] = await Promise.all([
      jiraEventQueue.getJobCounts(),
      githubEventQueue.getJobCounts(),
      workflowQueue.getJobCounts()
    ]);

    return {
      jira: jiraStats,
      github: githubStats,
      workflow: workflowStats
    };
  } catch (error) {
    logger.error('Error getting queue stats:', error);
    throw error;
  }
};

// Clean up queues
const cleanup = async () => {
  try {
    await Promise.all([
      jiraEventQueue.close(),
      githubEventQueue.close(),
      workflowQueue.close()
    ]);
    
    logger.info('All queues closed successfully');
  } catch (error) {
    logger.error('Error closing queues:', error);
    throw error;
  }
};

module.exports = {
  add,
  getStats,
  cleanup,
  jiraEventQueue,
  githubEventQueue,
  workflowQueue
}; 