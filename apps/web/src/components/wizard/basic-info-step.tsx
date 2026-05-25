"use client";

import { useRef, useState } from "react";
import { Button, Input, Label, Select, Textarea } from "@eventtix/ui";
import { ImagePlus, X, Link as LinkIcon } from "lucide-react";

interface BasicInfoStepProps {
  data: {
    title: string;
    description: string;
    shortDesc: string;
    category: string;
    eventType: string;
    coverImage: string;
    gallery: string[];
    videoUrl: string;
  };
  onChange: (data: any) => void;
  onNext: () => void;
}

const CATEGORIES = [
  "MUSIC", "TECH", "SPORTS", "ARTS", "FOOD", "BUSINESS", "OTHER",
];

const EVENT_TYPES = ["PHYSICAL", "VIRTUAL", "HYBRID"];

export function BasicInfoStep({ data, onChange, onNext }: BasicInfoStepProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [galUploading, setGalUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) return null;
    const { url } = await res.json();
    return url as string;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) onChange({ ...data, coverImage: url });
    setUploading(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGalUploading(true);
    const url = await uploadFile(file);
    if (url) onChange({ ...data, gallery: [...data.gallery, url] });
    setGalUploading(false);
  };

  const removeGallery = (i: number) => {
    onChange({ ...data, gallery: data.gallery.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Basic Information</h2>
        <p className="text-sm text-muted-foreground">
          Tell people about your event
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Event Title</Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="e.g. Lagos Tech Meetup 2025"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shortDesc">Short Description (optional)</Label>
        <Input
          id="shortDesc"
          value={data.shortDesc}
          onChange={(e) => onChange({ ...data, shortDesc: e.target.value })}
          placeholder="A brief tagline for your event"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Full Description</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Describe what attendees can expect..."
          rows={5}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            id="category"
            value={data.category}
            onChange={(e) => onChange({ ...data, category: e.target.value })}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0) + cat.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="eventType">Event Type</Label>
          <Select
            id="eventType"
            value={data.eventType}
            onChange={(e) => onChange({ ...data, eventType: e.target.value })}
          >
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <h3 className="font-medium text-sm">Media</h3>

        <div className="space-y-2">
          <Label className="text-xs">Cover Image</Label>
          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              <ImagePlus className="mr-1 h-4 w-4" />
              {uploading ? "Uploading..." : data.coverImage ? "Change" : "Upload"}
            </Button>
            {data.coverImage && (
              <img src={data.coverImage} alt="" className="h-10 w-10 rounded object-cover" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Gallery Images</Label>
          <div className="flex items-center gap-3">
            <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
            <Button type="button" variant="outline" size="sm" onClick={() => galleryRef.current?.click()} disabled={galUploading}>
              <ImagePlus className="mr-1 h-4 w-4" />
              {galUploading ? "Uploading..." : "Add Image"}
            </Button>
          </div>
          {data.gallery.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {data.gallery.map((url, i) => (
                <div key={i} className="group relative">
                  <img src={url} alt="" className="h-14 w-14 rounded object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGallery(i)}
                    className="absolute -right-1 -top-1 hidden rounded-full bg-destructive p-0.5 text-white group-hover:block"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Video URL (optional)</Label>
          <div className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={data.videoUrl}
              onChange={(e) => onChange({ ...data, videoUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>
      </div>

      <Button
        onClick={onNext}
        disabled={!data.title || data.description.length < 10}
      >
        Continue
      </Button>
    </div>
  );
}
