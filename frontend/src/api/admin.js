import request from './client';

export const getUsers = () => request('/users');

export const updateUser = (id, data) =>
  request(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteUser = (id) =>
  request(`/users/${id}`, { method: 'DELETE' });
