import React, { useRef, useState } from 'react';
import { Camera, User, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatar?: string;
  initials?: string;
  onAvatarChange?: (avatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  initials = 'U',
  onAvatarChange,
  size = 'lg',
  className,
}) => {
  const [avatar, setAvatar] = useState<string | undefined>(currentAvatar);
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const buttonSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-8 h-8',
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Format non supporté',
        description: 'Veuillez sélectionner une image (JPG, PNG, GIF).',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Fichier trop volumineux',
        description: 'La taille maximale est de 5 Mo.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    // Simulate upload delay and create local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setTimeout(() => {
        const result = reader.result as string;
        setAvatar(result);
        onAvatarChange?.(result);
        setIsUploading(false);
        toast({
          title: 'Photo mise à jour',
          description: 'Votre photo de profil a été modifiée avec succès.',
        });
      }, 800);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          sizeClasses[size],
          "rounded-full bg-muted flex items-center justify-center overflow-hidden transition-all duration-200",
          isHovered && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {avatar ? (
          <img 
            src={avatar} 
            alt="Avatar" 
            className="w-full h-full object-cover" 
          />
        ) : (
          <User className={cn(iconSizes[size], "text-muted-foreground")} />
        )}
        
        {/* Upload overlay */}
        {isHovered && !isUploading && (
          <div 
            className="absolute inset-0 bg-foreground/40 rounded-full flex items-center justify-center cursor-pointer transition-opacity"
            onClick={handleClick}
          >
            <Camera className="w-6 h-6 text-primary-foreground" />
          </div>
        )}
        
        {/* Loading state */}
        {isUploading && (
          <div className="absolute inset-0 bg-foreground/60 rounded-full flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      
      {/* Camera button */}
      <button
        onClick={handleClick}
        className={cn(
          buttonSizes[size],
          "absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all duration-200 shadow-lg hover:scale-105"
        )}
        disabled={isUploading}
      >
        {isUploading ? (
          <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
