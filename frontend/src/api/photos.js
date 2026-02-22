import request from './client';

export function uploadPhoto(profileId, { data, filename, position }) {
  return request(`/profiles/${profileId}/photos`, {
    method: 'POST',
    body: JSON.stringify({ photo: { data, filename, position } }),
  });
}

export function deletePhoto(profileId, photoId) {
  return request(`/profiles/${profileId}/photos/${photoId}`, {
    method: 'DELETE',
  });
}
