import { useState } from 'react';
import { uploadPhoto } from '../api/photos';

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function PhotoUploader({ profileId, photoCount, onPhotoAdded, onToast }) {
  const [uploading, setUploading] = useState([]);
  const remaining = 10 - (photoCount || 0);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        onToast('Only JPG, PNG, WEBP accepted', 'error');
        continue;
      }
      if (file.size > MAX_SIZE) {
        onToast('Photo exceeds 2MB limit', 'error');
        continue;
      }
      if (remaining <= 0) {
        onToast('Max 10 photos per profile', 'error');
        break;
      }

      const tempId = Date.now() + Math.random();
      setUploading((prev) => [...prev, tempId]);

      try {
        const base64 = await readFileAsBase64(file);
        const photo = await uploadPhoto(profileId, {
          data: base64,
          filename: file.name,
          position: photoCount + files.indexOf(file),
        });
        onPhotoAdded(photo);
        onToast('Photo added \u2713', 'success');
      } catch {
        onToast('Something went wrong', 'error');
      } finally {
        setUploading((prev) => prev.filter((id) => id !== tempId));
      }
    }
  };

  return (
    <div className="photo-uploader">
      <label className="btn btn--secondary photo-uploader__btn">
        Add Photos
        <input type="file" accept="image/*" multiple hidden onChange={handleFiles} />
      </label>
      <span className="photo-uploader__hint">{remaining} remaining</span>
      {uploading.length > 0 && <span className="photo-uploader__spinner">Uploading...</span>}
    </div>
  );
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
