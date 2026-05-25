"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  if (images.length === 0) return null;

  const next = () => setIdx((i) => (i + 1) % images.length);
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((url, i) => (
          <button key={i} type="button" onClick={() => { setIdx(i); setOpen(true); }}>
            <img src={url} alt="" className="h-40 w-full rounded-lg object-cover transition-opacity hover:opacity-80" />
          </button>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setOpen(false)}>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white" onClick={(e) => { e.stopPropagation(); prev(); }}>
            <ChevronLeft className="h-8 w-8" />
          </button>
          <img src={images[idx]} alt="" className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white" onClick={(e) => { e.stopPropagation(); next(); }}>
            <ChevronRight className="h-8 w-8" />
          </button>
          <button className="absolute right-4 top-4 text-white" onClick={() => setOpen(false)}>
            <X className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 text-sm text-white">
            {idx + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
