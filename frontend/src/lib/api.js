const RFQ_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
const API_ORIGIN = RFQ_API_BASE_URL.replace(/\/api\/?$/, '');

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = response.status;
    throw error;
  }

  return data;
}

export function rfqApi(path, options = {}) {
  return request(RFQ_API_BASE_URL, path, options);
}

export function authApi(path, options = {}) {
  return request(API_ORIGIN, path, options);
}

export const apiConfig = {
  rfqBaseUrl: RFQ_API_BASE_URL,
  apiOrigin: API_ORIGIN
};
