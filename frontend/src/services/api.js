import axios from 'axios';

// Use relative URL for API - works regardless of domain
const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 second timeout for search operations
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);

    // Network error - backend unreachable
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      const networkError = new Error('Unable to connect to the server. Please check if the backend is running.');
      networkError.isNetworkError = true;
      throw networkError;
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. The pattern might be too complex.');
    }

    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }

    if (error.response?.status === 404) {
      throw new Error('API endpoint not found. Please check your configuration.');
    }

    if (error.response?.status === 502 || error.response?.status === 503 || error.response?.status === 504) {
      const gatewayError = new Error('Backend service is unavailable. Please try again later.');
      gatewayError.isNetworkError = true;
      throw gatewayError;
    }

    throw error;
  }
);

/**
 * Get available dictionaries
 */
export const getDictionaries = async () => {
  try {
    const response = await api.get('/dictionaries');
    return response.data;
  } catch (error) {
    console.error('Failed to load dictionaries:', error);
    throw error;
  }
};

/**
 * Search for patterns using the paginated API
 */
export const searchPatterns = async (query, limit = 50, offset = 0, maxComputation = 1000000, dictionary = 'wikipedia') => {
  try {
    const response = await api.get('/search', {
      params: {
        q: query,
        dictionary,
        limit,
        offset,
        max_computation: maxComputation,
      },
    });
    
    return response.data;
  } catch (error) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw error;
  }
};

/**
 * Get streaming search results for infinite scroll
 * Note: This would typically use Server-Sent Events or WebSockets
 * For now, we'll use the paginated API
 */
export const searchPatternsStreaming = async function* (query, maxComputation = 1000000, dictionary = 'wikipedia') {
  let offset = 0;
  const limit = 50;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const response = await searchPatterns(query, limit, offset, maxComputation, dictionary);
      
      if (response.error) {
        yield { type: 'error', message: response.error };
        return;
      }
      
      for (const result of response.results) {
        yield { type: 'result', data: result };
      }
      
      if (response.computation_limit_reached) {
        yield { type: 'limit_reached', computation: maxComputation };
        return;
      }
      
      hasMore = response.results.length === limit;
      offset += limit;
      
      if (!hasMore) {
        yield { type: 'done' };
      }
      
    } catch (error) {
      yield { type: 'error', message: error.message };
      return;
    }
  }
};

/**
 * Get pattern syntax reference
 */
export const getSyntax = async () => {
  try {
    const response = await api.get('/syntax');
    return response.data;
  } catch (error) {
    console.error('Failed to load syntax reference:', error);
    return [];
  }
};

/**
 * Get example queries
 */
export const getExamples = async () => {
  try {
    const response = await api.get('/examples');
    return response.data;
  } catch (error) {
    console.error('Failed to load examples:', error);
    return [];
  }
};

/**
 * Check API health
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}; 