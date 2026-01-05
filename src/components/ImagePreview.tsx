import * as React from "react";
import { createPortal } from "react-dom";
import { X, ZoomIn, ZoomOut, RotateCw, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  imageSrc: string;
  alt?: string;
  open: boolean;
  onClose: () => void;
}

export function ImagePreview({
  imageSrc,
  alt = "Preview",
  open,
  onClose,
}: ImagePreviewProps) {
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Reset state when opening
  React.useEffect(() => {
    if (open) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  }, [open]);

  // Handle keyboard shortcuts
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setScale((s) => Math.min(s + 0.25, 5));
      if (e.key === "-") setScale((s) => Math.max(s - 0.25, 0.25));
      if (e.key === "r") setRotation((r) => (r + 90) % 360);
      if (e.key === "0") {
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
      }
    };

    // Prevent background scroll
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  // Mouse wheel zoom
  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((s) => Math.min(Math.max(s + delta, 0.25), 5));
  }, []);

  // Pan handlers
  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      if (scale <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    },
    [scale, position]
  );

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = React.useCallback(
    (e: React.TouchEvent) => {
      if (scale <= 1 || e.touches.length !== 1) return;
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    },
    [scale, position]
  );

  const handleTouchMove = React.useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleTouchEnd = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 5));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.25));
  const rotate = () => setRotation((r) => (r + 90) % 360);
  const reset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/95"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/20 hover:bg-background/40 transition-colors"
      >
        <X className="h-6 w-6 text-white" />
        <span className="sr-only">Tutup</span>
      </button>

      {/* Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-background/20 backdrop-blur-sm rounded-full px-4 py-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={zoomOut}
          className="h-8 w-8 text-white hover:bg-white/20"
          title="Zoom Out (-)"
        >
          <ZoomOut size={18} />
        </Button>
        <span className="text-white text-sm min-w-[3rem] text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={zoomIn}
          className="h-8 w-8 text-white hover:bg-white/20"
          title="Zoom In (+)"
        >
          <ZoomIn size={18} />
        </Button>
        <div className="w-px h-4 bg-white/30 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={rotate}
          className="h-8 w-8 text-white hover:bg-white/20"
          title="Rotate (R)"
        >
          <RotateCw size={18} />
        </Button>
        <div className="w-px h-4 bg-white/30 mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={reset}
          className="h-8 text-white hover:bg-white/20 text-xs"
          title="Reset (0)"
        >
          Reset
        </Button>
      </div>

      {/* Hint */}
      {scale > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-background/20 backdrop-blur-sm rounded-full px-3 py-1 text-white/70 text-xs">
          <Move size={14} />
          Drag untuk geser
        </div>
      )}

      {/* Image container */}
      <div
        ref={containerRef}
        className={cn(
          "absolute inset-0 flex items-center justify-center overflow-hidden",
          scale > 1 ? "cursor-grab" : "cursor-default",
          isDragging && "cursor-grabbing"
        )}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={imageSrc}
          alt={alt}
          className="max-w-[90vw] max-h-[85vh] object-contain select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
          draggable={false}
        />
      </div>
    </div>,
    document.body
  );
}
