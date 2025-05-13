//const API_BASE_URL = 'http://localhost:5125/api/Channel'; //const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/Channel`;
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5125'}/api/Channel`;
//const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/Channel`;



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
        errorData.title || 
        `Request failed with status ${response.status}` 
      );
    }

  if (response.status === 204) return null; // No content on DELETE

    return await response.json(); 
    
  } catch (error) {
    console.error(`API request to ${url} failed:`, error.message);
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

// delete channel
export const deleteChannel = async (id) => {
  return handleRequest(`${API_BASE_URL}/${id}`, {
    method: 'DELETE'
  });
};