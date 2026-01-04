import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AdminModal } from "@/components/AdminModal";
import { ZoomIn, ZoomOut, RotateCw, Check, X } from "lucide-react";

interface AspectRatioOption {
  label: string;
  value: number;
}

interface ImageCropperProps {
  imageSrc: string;
  open: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageBlob: Blob) => void;
  aspectRatioOptions?: AspectRatioOption[];
  defaultAspectRatio?: number;
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new Image();
  image.src = imageSrc;
  
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas is empty"));
        }
      },
      "image/jpeg",
      0.9
    );
  });
}

const DEFAULT_ASPECT_OPTIONS: AspectRatioOption[] = [
  { label: "1:1", value: 1 },
];

export function ImageCropper({
  imageSrc,
  open,
  onClose,
  onCropComplete,
  aspectRatioOptions = DEFAULT_ASPECT_OPTIONS,
  defaultAspectRatio,
}: ImageCropperProps) {
  const initialRatio = defaultAspectRatio ?? aspectRatioOptions[0]?.value ?? 1;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(initialRatio);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const showAspectOptions = aspectRatioOptions.length > 1;

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteHandler = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    setProcessing(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedImage);
      handleClose();
    } catch (error) {
      console.error("Error cropping image:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    onClose();
  };

  const currentLabel = aspectRatioOptions.find(opt => opt.value === aspectRatio)?.label || "Custom";

  return (
    <AdminModal
      open={open}
      title={`Crop Foto${showAspectOptions ? ` (${currentLabel})` : " (1:1)"}`}
      onClose={handleClose}
      className="sm:max-w-lg"
    >
      <div className="space-y-4">
        <div className="relative w-full h-64 sm:h-80 bg-muted rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteHandler}
            cropShape="rect"
            showGrid
          />
        </div>

        <div className="space-y-4">
          {showAspectOptions && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Rasio:</span>
              {aspectRatioOptions.map((option) => (
                <Button
                  key={option.label}
                  variant={aspectRatio === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAspectRatio(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4">
            <ZoomOut size={18} className="text-muted-foreground" />
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={1}
              max={3}
              step={0.1}
              className="flex-1"
            />
            <ZoomIn size={18} className="text-muted-foreground" />
          </div>

          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
            >
              <RotateCw size={16} className="mr-2" />
              Putar 90°
            </Button>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleClose} disabled={processing}>
            <X size={16} className="mr-2" />
            Batal
          </Button>
          <Button onClick={handleConfirm} disabled={processing || !croppedAreaPixels}>
            <Check size={16} className="mr-2" />
            {processing ? "Memproses..." : "Terapkan"}
          </Button>
        </div>
      </div>
    </AdminModal>
  );
}
