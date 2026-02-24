import { getToken } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  const token = getToken();
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      ...authHeader,
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
}

export default request;
