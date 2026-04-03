import { useRef } from 'react';
import { Camera, X } from 'lucide-react';

interface PhotoUploadProps {
  photo: string | undefined;
  onPhotoChange: (photo: string | undefined) => void;
  size?: 'sm' | 'lg';
  label?: string;
}

const PhotoUpload = ({ photo, onPhotoChange, size = 'lg', label }: PhotoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Max 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onPhotoChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  const dims = size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';
  const iconSize = size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';

  return (
    <div className="flex flex-col items-center gap-2">
      {label && <span className="text-xs text-muted-foreground font-body">{label}</span>}
      <div className="relative">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`${dims} rounded-full overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center bg-muted/50`}
        >
          {photo ? (
            <img src={photo} alt="Photo" className="w-full h-full object-cover" />
          ) : (
            <Camera className={`${iconSize} text-muted-foreground`} />
          )}
        </button>
        {photo && (
          <button
            type="button"
            onClick={() => onPhotoChange(undefined)}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
    </div>
  );
};

export default PhotoUpload;
