const { Client } = require('@elastic/elasticsearch');
const { logger } = require('../utils/logger');

let esClient;

const connectElasticsearch = () => {
  try {
    esClient = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      auth: process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD ? {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
      } : undefined,
      requestTimeout: 60000,
      pingTimeout: 3000,
      resurrectStrategy: 'ping'
    });

    // Test connection
    esClient.ping().then(() => {
      logger.info('Elasticsearch connected successfully');
    }).catch((error) => {
      logger.warn('Elasticsearch connection failed:', error.message);
    });

    return esClient;
  } catch (error) {
    logger.error('Elasticsearch initialization failed:', error);
    return null;
  }
};

const getESClient = () => {
  if (!esClient) {
    esClient = connectElasticsearch();
  }
  return esClient;
};

module.exports = { connectElasticsearch, getESClient };