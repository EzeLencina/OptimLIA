import type { PhotoItem, VideoScript } from '../../../domain/types';
import { VIDEO_SEGMENTS } from '../../../domain/constants';
import { Toggle } from '../common/Toggle';

interface PhotosStepProps {
  photos: PhotoItem[];
  video: VideoScript;
  onUpdatePhotos: (photos: PhotoItem[]) => void;
  onUpdateVideo: (field: keyof VideoScript, value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function PhotosStep({
  photos,
  video,
  onUpdatePhotos,
  onUpdateVideo,
  onNext,
  onPrev,
}: PhotosStepProps) {
  const togglePhoto = (id: number) => {
    onUpdatePhotos(
      photos.map((p) => (p.id === id ? { ...p, checked: !p.checked } : p))
    );
  };

  return (
    <div className="step-panel active">
      <div className="panel-header">
        <h2><i className="fas fa-camera" /> Fotos y Video</h2>
        <p>Las fotos deciden la venta. Marca cada tipo que ya tengas listo para armar una publicacion que convierte.</p>
      </div>

      <div className="photo-checklist">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className={`photo-item${photo.checked ? ' checked' : ''}`}
          >
            <div className="photo-number">
              {photo.checked ? <i className="fas fa-check" /> : photo.id}
            </div>
            <div className="photo-content">
              <h4>{photo.title}</h4>
              <p>{photo.description}</p>
            </div>
            <Toggle checked={photo.checked} onChange={() => togglePhoto(photo.id)} />
          </div>
        ))}
      </div>

      <h3 className="section-subtitle"><i className="fas fa-video" /> Video Promocional (20-60s)</h3>
      <div className="video-timeline">
        {VIDEO_SEGMENTS.map((seg) => (
          <div key={seg.field} className="timeline-segment">
            <div className="segment-time">{seg.time}</div>
            <div className="segment-content">
              <h4>{seg.title}</h4>
              <p>{seg.description}</p>
              <input
                type="text"
                value={video[seg.field]}
                onChange={(e) => onUpdateVideo(seg.field, e.target.value)}
                placeholder={`Ej: ${seg.description}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="panel-actions">
        <button className="btn btn-secondary" onClick={onPrev}>
          <i className="fas fa-arrow-left" /> Anterior
        </button>
        <button className="btn btn-primary" onClick={onNext}>
          Siguiente <i className="fas fa-arrow-right" />
        </button>
      </div>
    </div>
  );
}
