const { MeiliSearch } = require('meilisearch');

const MEILI_HOST = process.env.MEILI_HOST || 'http://localhost:7700';
const MEILI_API_KEY = process.env.MEILI_API_KEY || 'raynix_search_key';
const INDEX_NAME = 'pdf_metadata';

// Initialize MeiliSearch client
const client = new MeiliSearch({
  host: MEILI_HOST,
  apiKey: MEILI_API_KEY,
});

// Index configuration
const indexConfig = {
  searchableAttributes: [
    'title',
    'description',
    'tags',
    'category',
    'subcategory'
  ],
  filterableAttributes: [
    'category',
    'subcategory',
    'visibility',
    'tags'
  ],
  sortableAttributes: [
    'title',
    'category',
    'created_at'
  ],
  displayedAttributes: [
    'file_id',
    'title',
    'description',
    'tags',
    'category',
    'subcategory',
    'visibility',
    'created_at'
  ],
  rankingRules: [
    'words',
    'typo',
    'proximity',
    'attribute',
    'sort',
    'exactness'
  ],
  typoTolerance: {
    enabled: true,
    minWordSizeForTypos: {
      oneTypo: 5,
      twoTypos: 9
    }
  },
  pagination: {
    maxTotalHits: 1000
  }
};

// Initialize index with configuration
const initializeIndex = async () => {
  try {
    
    // Create index if it doesn't exist
    const index = client.index(INDEX_NAME);
    
    // Check if index exists
    try {
      await index.getStats();
    } catch (error) {
      if (error.code === 'index_not_found') {
        await client.createIndex(INDEX_NAME, { primaryKey: 'file_id' });
      } else {
        throw error;
      }
    }
    
    // Update index settings
    await index.updateSettings(indexConfig);
    
    return index;
  } catch (error) {
    throw error;
  }
};

// Get index instance
const getIndex = () => {
  return client.index(INDEX_NAME);
};

// Test connection
const testConnection = async () => {
  try {
    await client.health();
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  client,
  getIndex,
  initializeIndex,
  testConnection,
  INDEX_NAME
};