import request from './client';

export function getProfiles(sortBy, sortDir) {
  const params = new URLSearchParams();
  if (sortBy) params.set('sort_by', sortBy);
  if (sortDir) params.set('sort_dir', sortDir);
  const query = params.toString();
  return request(`/profiles${query ? `?${query}` : ''}`);
}

export function getProfile(id) {
  return request(`/profiles/${id}`);
}

export function createProfile(data) {
  return request('/profiles', {
    method: 'POST',
    body: JSON.stringify({ profile: data }),
  });
}

export function updateProfile(id, data) {
  return request(`/profiles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ profile: data }),
  });
}

export function deleteProfile(id) {
  return request(`/profiles/${id}`, { method: 'DELETE' });
}
