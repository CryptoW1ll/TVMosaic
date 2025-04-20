const API_BASE_URL = 'http://localhost:5125/api/Channel';

// Common fetch handler
async function handleRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include' // Needed for CORS with credentials
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || 
        `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${error.message}`);
    throw error; // Re-throw for component-level handling
  }
}

// Fetch single channel
export const fetchChannel = async (id) => {
  return handleRequest(`${API_BASE_URL}/${id}`);
};

// Fetch all channels
export const fetchAllChannels = async () => {
  return handleRequest(API_BASE_URL);
};

// Example POST function
export const createChannel = async (channelData) => {
  return handleRequest(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(channelData)
  });
};