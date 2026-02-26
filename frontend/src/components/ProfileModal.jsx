import { useState, useEffect, useRef } from 'react';
import { createProfile, updateProfile } from '../api/profiles';
import { uploadPhoto } from '../api/photos';
import { computeAge, randomAvatarColor, STATUS_OPTIONS, EDU_LEVELS, RASHI_OPTIONS } from '../utils/helpers';
import PhotoUploader from './PhotoUploader';
import PhotoGallery from './PhotoGallery';

const SOURCE_OPTIONS = [
  'Matrimony Site', 'Family', 'Friend', 'Social Media', 'Common Contact', 'Other',
];

const EMPTY = {
  first_name: '', last_name: '', date_of_birth: '', height_cm: '',
  city: '', state: '', caste: '', subcaste: '',
  edu_level: '', edu_field: '', edu_institution: '',
  profession_title: '', company: '', company_location: '', package: '',
  fathers_name: '', fathers_occupation: '', mothers_name: '', mothers_occupation: '', siblings: '',
  rashi: '', nakshatra: '', gotra: '',
  status: 'New', starred: false, notes: '',  avatar_color: '',
  source: '', phone: '', meeting_date: '',
  linkedin: '', instagram: '',
};

const MAX_SIZE = 6 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ProfileModal({ profile, onClose, onSaved, onToast }) {
  const isEdit = !!profile?.id;
  const [form, setForm] = useState(EMPTY);
  const [photos, setPhotos] = useState([]);
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const pendingPhotosRef = useRef(pendingPhotos);
  pendingPhotosRef.current = pendingPhotos;
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [ftVal, setFtVal] = useState('');
  const [inVal, setInVal] = useState('');
  const [cmVal, setCmVal] = useState('');

  const handlePendingFiles = (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';

    const valid = [];
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        onToast('Only JPG, PNG, WEBP accepted', 'error');
        continue;
      }
      if (file.size > MAX_SIZE) {
        onToast('Photo exceeds 6MB limit', 'error');
        continue;
      }
      valid.push(file);
    }

    setPendingPhotos((prev) => {
      const remaining = 10 - prev.length;
      if (valid.length > remaining) {
        onToast('Max 10 photos per profile', 'error');
      }
      const toAdd = valid.slice(0, remaining).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        filename: file.name,
        id: Date.now() + Math.random(),
      }));
      return [...prev, ...toAdd];
    });
  };

  const removePendingPhoto = (id) => {
    setPendingPhotos((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((p) => p.id !== id);
    });
  };

  useEffect(() => {
    if (profile) {
      setForm({
        ...EMPTY,
        ...Object.fromEntries(
          Object.entries(profile).filter(([_, v]) => v !== null).map(([k, v]) => [k, v])
        ),
        package: profile.package ?? '',
        height_cm: profile.height_cm ?? '',
        siblings: profile.siblings ?? '',
      });
      setPhotos(profile.photos || []);
    } else {
      setForm({ ...EMPTY, avatar_color: randomAvatarColor() });
      setPhotos([]);
    }
    initHeightInputs(profile?.height_cm ?? null);
  }, [profile]);

  // Populate all three height fields from a cm value (or clear them)
  function initHeightInputs(cm) {
    if (cm != null && cm !== '') {
      const { ft, inn } = cmToFtInParts(cm);
      setFtVal(String(ft));
      setInVal(String(inn));
      setCmVal(String(cm));
    } else {
      setFtVal(''); setInVal(''); setCmVal('');
    }
  }

  // cm → { ft, inn } with inch-overflow guard
  function cmToFtInParts(cm) {
    const totalInches = Number(cm) / 2.54;
    const ft = Math.floor(totalInches / 12);
    let inn = Math.round(totalInches % 12);
    if (inn === 12) { return { ft: ft + 1, inn: 0 }; }
    return { ft, inn };
  }

  useEffect(() => {
    return () => {
      pendingPhotosRef.current.forEach((p) => {
        if (p.preview) URL.revokeObjectURL(p.preview);
      });
    };
  }, []);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleFtChange = (e) => {
    const val = e.target.value;
    setFtVal(val);
    const ft = val === '' ? 0 : parseFloat(val);
    const inn = inVal === '' ? 0 : parseFloat(inVal);
    if (val === '' && inVal === '') {
      setCmVal('');
      setForm(f => ({ ...f, height_cm: '' }));
    } else if (!isNaN(ft)) {
      const cm = Math.round((ft * 12 + (isNaN(inn) ? 0 : inn)) * 2.54);
      setCmVal(String(cm));
      setForm(f => ({ ...f, height_cm: String(cm) }));
    }
  };

  const handleInChange = (e) => {
    const val = e.target.value;
    setInVal(val);
    const ft = ftVal === '' ? 0 : parseFloat(ftVal);
    const inn = val === '' ? 0 : parseFloat(val);
    if (ftVal === '' && val === '') {
      setCmVal('');
      setForm(f => ({ ...f, height_cm: '' }));
    } else if (!isNaN(inn)) {
      const cm = Math.round(((isNaN(ft) ? 0 : ft) * 12 + inn) * 2.54);
      setCmVal(String(cm));
      setForm(f => ({ ...f, height_cm: String(cm) }));
    }
  };

  const handleCmChange = (e) => {
    const val = e.target.value;
    setCmVal(val);
    if (val === '') {
      setFtVal(''); setInVal('');
      setForm(f => ({ ...f, height_cm: '' }));
      return;
    }
    const cm = parseFloat(val);
    if (isNaN(cm) || cm <= 0) return;
    const { ft, inn } = cmToFtInParts(cm);
    setFtVal(String(ft));
    setInVal(String(inn));
    setForm(f => ({ ...f, height_cm: String(Math.round(cm)) }));
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'Required';
    if (!form.last_name.trim()) errs.last_name = 'Required';
    if (!form.date_of_birth) errs.date_of_birth = 'Required';
    if (!form.city.trim()) errs.city = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        height_cm: form.height_cm === '' ? null : Number(form.height_cm),
        package: form.package === '' ? null : Number(form.package),
        siblings: form.siblings === '' ? null : Number(form.siblings),
      };
      if (isEdit) {
        await updateProfile(profile.id, payload);
      } else {
        const created = await createProfile(payload);
        for (let i = 0; i < pendingPhotos.length; i++) {
          try {
            await uploadPhoto(created.id, pendingPhotos[i].file, i);
          } catch {
            onToast(`Failed to upload ${pendingPhotos[i].filename}`, 'error');
          }
        }
      }
      onToast('Profile saved \u2713', 'success');
      onSaved();
    } catch {
      onToast('Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  };

  const age = form.date_of_birth ? computeAge(form.date_of_birth) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-modal__header">
          <h2>{isEdit ? 'Edit Profile' : 'Add Profile'}</h2>
          <button className="profile-modal__close" onClick={onClose}>&times;</button>
        </div>

        <div className="profile-modal__body">
          <Section title="Personal">
            <Field label="First Name *" error={errors.first_name}>
              <input value={form.first_name} onChange={set('first_name')} />
            </Field>
            <Field label="Last Name *" error={errors.last_name}>
              <input value={form.last_name} onChange={set('last_name')} />
            </Field>
            <Field label="Date of Birth *" error={errors.date_of_birth}>
              <input type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
              {age !== null && <span className="field-hint">Age: {age} years</span>}
            </Field>
            <Field label="Height">
              <div className="height-input">
                <div className="height-input__imperial">
                  <input
                    type="number"
                    min="0" max="9"
                    value={ftVal}
                    onChange={handleFtChange}
                    placeholder="5"
                    className="height-input__ft"
                  />
                  <span className="height-input__sym">'</span>
                  <input
                    type="number"
                    min="0" max="11"
                    value={inVal}
                    onChange={handleInChange}
                    placeholder="7"
                    className="height-input__in"
                  />
                  <span className="height-input__sym">"</span>
                </div>
                <div className="height-input__metric">
                  <input
                    type="number"
                    min="0"
                    value={cmVal}
                    onChange={handleCmChange}
                    placeholder="170"
                    className="height-input__cm"
                  />
                  <span className="height-input__sym">cm</span>
                </div>
              </div>
            </Field>
          </Section>

          <Section title="Location">
            <Field label="City *" error={errors.city}>
              <input value={form.city} onChange={set('city')} />
            </Field>
            <Field label="State">
              <input value={form.state} onChange={set('state')} />
            </Field>
          </Section>

          <Section title="Background">
            <Field label="Caste">
              <input value={form.caste} onChange={set('caste')} />
            </Field>
            <Field label="Subcaste">
              <input value={form.subcaste} onChange={set('subcaste')} />
            </Field>
          </Section>

          <Section title="Education">
            <Field label="Education Level">
              <select value={form.edu_level} onChange={set('edu_level')}>
                <option value="">Select...</option>
                {EDU_LEVELS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </Field>
            <Field label="Field of Study">
              <input value={form.edu_field} onChange={set('edu_field')} />
            </Field>
            <Field label="Institution">
              <input value={form.edu_institution} onChange={set('edu_institution')} />
            </Field>
          </Section>

          <Section title="Career">
            <Field label="Profession Title">
              <input value={form.profession_title} onChange={set('profession_title')} />
            </Field>
            <Field label="Company">
              <input value={form.company} onChange={set('company')} />
            </Field>
            <Field label="Company Location">
              <input value={form.company_location} onChange={set('company_location')} placeholder="e.g. Bengaluru" />
            </Field>
            <Field label="Package (LPA)">
              <input type="number" step="0.1" value={form.package} onChange={set('package')} placeholder="e.g. 14.5" />
            </Field>
          </Section>

          <Section title="Family">
            <Field label="Father's Name">
              <input value={form.fathers_name} onChange={set('fathers_name')} />
            </Field>
            <Field label="Father's Occupation">
              <input value={form.fathers_occupation} onChange={set('fathers_occupation')} />
            </Field>
            <Field label="Mother's Name">
              <input value={form.mothers_name} onChange={set('mothers_name')} />
            </Field>
            <Field label="Mother's Occupation">
              <input value={form.mothers_occupation} onChange={set('mothers_occupation')} />
            </Field>
            <Field label="Siblings">
              <input type="number" value={form.siblings} onChange={set('siblings')} />
            </Field>
          </Section>

          <Section title="Horoscope">
            <Field label="Rashi">
              <select value={form.rashi} onChange={set('rashi')}>
                <option value="">Select...</option>
                {RASHI_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Nakshatra">
              <input value={form.nakshatra} onChange={set('nakshatra')} />
            </Field>
            <Field label="Gotra">
              <input value={form.gotra} onChange={set('gotra')} />
            </Field>
          </Section>

          <Section title="Status">
            <Field label="Status">
              <select value={form.status} onChange={set('status')}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="">
              <label className="checkbox-label">
                <input type="checkbox" checked={form.starred} onChange={set('starred')} />
                Starred
              </label>
            </Field>
            <Field label="Meeting Date">
              <input type="date" value={form.meeting_date} onChange={set('meeting_date')} />
            </Field>
            <Field label="Notes" full>
              <textarea rows={3} value={form.notes} onChange={set('notes')} />
            </Field>
          </Section>

          <Section title="Contact &amp; Source">
            <Field label="Phone">
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
            </Field>
            <Field label="LinkedIn">
              <input type="url" value={form.linkedin} onChange={set('linkedin')} placeholder="linkedin.com/in/username" />
            </Field>
            <Field label="Instagram">
              <input value={form.instagram} onChange={set('instagram')} placeholder="@username" />
            </Field>
            <Field label="Source">
              <select value={form.source} onChange={set('source')}>
                <option value="">Select source…</option>
                {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </Section>

          {isEdit && (
            <Section title="Photos">
              <PhotoGallery
                profileId={profile.id}
                photos={photos}
                onPhotosChange={setPhotos}
                onToast={onToast}
              />
              <PhotoUploader
                profileId={profile.id}
                photoCount={photos.length}
                onPhotoAdded={(p) => setPhotos((prev) => [...prev, p])}
                onToast={onToast}
              />
            </Section>
          )}

          {!isEdit && (
            <Section title="Photos">
              {pendingPhotos.length > 0 && (
                <div className="photo-gallery">
                  <p className="photo-gallery__count">{pendingPhotos.length} / 10 photos</p>
                  <div className="photo-gallery__strip">
                    {pendingPhotos.map((photo, i) => (
                      <div key={photo.id} className="photo-gallery__thumb">
                        <img src={photo.preview} alt={photo.filename || 'Photo'} />
                        {i === 0 && <span className="photo-gallery__primary">Primary</span>}
                        <button className="photo-gallery__delete" onClick={() => removePendingPhoto(photo.id)}>&times;</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="photo-uploader">
                <label className="btn btn--secondary photo-uploader__btn">
                  Add Photos
                  <input type="file" accept="image/*" multiple hidden onChange={handlePendingFiles} />
                </label>
                <span className="photo-uploader__hint">{10 - pendingPhotos.length} remaining</span>
              </div>
            </Section>
          )}
        </div>

        <div className="profile-modal__footer">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <fieldset className="profile-modal__section">
      <legend>{title}</legend>
      <div className="profile-modal__grid">{children}</div>
    </fieldset>
  );
}

function Field({ label, error, full, children }) {
  return (
    <div className={full ? 'field field--full' : 'field'}>
      {label && <label className="field__label">{label}</label>}
      {children}
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}
