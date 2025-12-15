"use client";

// ============================================
// image cropper component
// ============================================
// allows users to crop images before uploading as avatar or header
// uses react-image-crop for the cropping functionality

import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCropperProps {
  imageSrc: string;
  aspectRatio: number; // 1 for avatar (square), 3 for header (wide)
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  cropShape?: "round" | "rect";
}

// helper to create initial centered crop
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export function ImageCropper({
  imageSrc,
  aspectRatio,
  onCropComplete,
  onCancel,
  cropShape = "rect",
}: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [isProcessing, setIsProcessing] = useState(false);

  // when image loads, set up initial centered crop
  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspectRatio));
    },
    [aspectRatio]
  );

  // reset crop to center
  const handleReset = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, aspectRatio));
    }
  };

  // process the crop and return a blob
  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsProcessing(true);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no canvas context");

      const image = imgRef.current;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // set canvas size to crop size (scaled to natural image size)
      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      // output at reasonable resolution (max 800px for avatars, 1600px for headers)
      const maxSize = aspectRatio === 1 ? 800 : 1600;
      const outputWidth = Math.min(cropWidth, maxSize);
      const outputHeight = Math.min(cropHeight, maxSize / aspectRatio);

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      // draw the cropped portion
      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        outputWidth,
        outputHeight
      );

      // convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            onCropComplete(blob);
          }
          setIsProcessing(false);
        },
        "image/jpeg",
        0.9 // quality
      );
    } catch (error) {
      console.error("crop error:", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold">Crop Image</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* crop area */}
        <div className="p-4 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/50 min-h-[300px] max-h-[60vh] overflow-auto">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
            circularCrop={cropShape === "round"}
            className="max-w-full"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={onImageLoad}
              className="max-w-full max-h-[50vh] object-contain"
            />
          </ReactCrop>
        </div>

        {/* actions */}
        <div className="flex items-center justify-between p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCropComplete}
              disabled={isProcessing || !completedCrop}
              className={cn(
                "flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors",
                isProcessing || !completedCrop
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
              )}
            >
              <Check className="w-4 h-4" />
              {isProcessing ? "Processing..." : "Apply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
