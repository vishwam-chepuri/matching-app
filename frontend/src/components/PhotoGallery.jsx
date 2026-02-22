import { deletePhoto } from '../api/photos';

export default function PhotoGallery({ profileId, photos, onPhotosChange, onToast }) {
  const handleDelete = async (photoId) => {
    try {
      await deletePhoto(profileId, photoId);
      onPhotosChange(photos.filter((p) => p.id !== photoId));
      onToast('Photo removed', 'success');
    } catch {
      onToast('Something went wrong', 'error');
    }
  };

  if (!photos?.length) return null;

  return (
    <div className="photo-gallery">
      <p className="photo-gallery__count">{photos.length} / 10 photos</p>
      <div className="photo-gallery__strip">
        {photos.map((photo, i) => (
          <div key={photo.id} className="photo-gallery__thumb">
            <img src={photo.data} alt={photo.filename || 'Photo'} />
            {i === 0 && <span className="photo-gallery__primary">Primary</span>}
            <button className="photo-gallery__delete" onClick={() => handleDelete(photo.id)}>&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
}
