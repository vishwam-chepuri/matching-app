import request from './client';

export function uploadPhoto(profileId, file, position) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('position', position);

  return request(`/profiles/${profileId}/photos`, {
    method: 'POST',
    body: formData,
  });
}

export function deletePhoto(profileId, photoId) {
  return request(`/profiles/${profileId}/photos/${photoId}`, {
    method: 'DELETE',
  });
}
