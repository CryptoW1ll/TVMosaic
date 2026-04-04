//const API_BASE_URL = 'http://localhost:5125/api/Channel'; //const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/Channel`;
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5125'}/api/Channel`;
//const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/Channel`;

function normalizeCategory(value) {
  const cleaned = String(value ?? '').trim();
  if (!cleaned) return 'General';
  const lowered = cleaned.toLowerCase();
  if (lowered === 'undefined' || lowered === 'null' || lowered === 'n/a') {
    return 'General';
  }
  return cleaned;
}

function normalizeChannel(raw = {}) {
  const channelId = raw.channelId ?? raw.ChannelId ?? raw.id ?? raw.Id ?? null;
  const tvgId = raw.tvgId ?? raw.TvgId ?? '';
  const name = raw.name ?? raw.Name ?? 'Unknown Channel';
  const logo = raw.logo ?? raw.Logo ?? '';
  const category = normalizeCategory(raw.category ?? raw.Category);
  const url = raw.url ?? raw.Url ?? '';

  // Keep both casing variants for backward compatibility with existing components.
  return {
    ...raw,
    channelId,
    ChannelId: channelId,
    tvgId,
    TvgId: tvgId,
    name,
    Name: name,
    logo,
    Logo: logo,
    category,
    Category: category,
    url,
    Url: url,
  };
}

function normalizeChannelResponse(payload) {
  if (Array.isArray(payload)) return payload.map(normalizeChannel);
  if (payload && typeof payload === 'object') return normalizeChannel(payload);
  return payload;
}



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
  const data = await handleRequest(`${API_BASE_URL}/${id}`);
  return normalizeChannelResponse(data);
};

// Fetch all channels
export const fetchAllChannels = async () => {
  const data = await handleRequest(API_BASE_URL);
  return normalizeChannelResponse(data);
};

// Example POST function
export const createChannel = async (channelData) => {
  const data = await handleRequest(API_BASE_URL, {
    method: 'POST',
    body: JSON.stringify(channelData)
  });
  return normalizeChannelResponse(data);
};

// delete channel
export const deleteChannel = async (id) => {
  return handleRequest(`${API_BASE_URL}/${id}`, {
    method: 'DELETE'
  });
};