import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut } from "lucide-react";

interface CoverImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedAreaPixels: any) => void;
  onCancel: () => void;
}

export const CoverImageCropper = ({ imageSrc, onCropComplete, onCancel }: CoverImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = useCallback((crop: any) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = () => {
    if (croppedAreaPixels) {
      onCropComplete(croppedAreaPixels);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative h-64 w-full bg-black rounded-lg overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={16 / 4}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteCallback}
          onZoomChange={onZoomChange}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <ZoomOut className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[zoom]}
            onValueChange={(value) => setZoom(value[0])}
            min={1}
            max={3}
            step={0.1}
            className="flex-1"
          />
          <ZoomIn className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Arraste para posicionar • Use o controle para ajustar o zoom
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button onClick={handleSave} className="flex-1">
          Aplicar
        </Button>
      </div>
    </div>
  );
};
