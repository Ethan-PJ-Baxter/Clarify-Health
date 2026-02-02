"use client";

import { useState, useRef, useCallback } from "react";
import { ArrowLeft, Camera, X, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const MAX_FILES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

interface UploadingFile {
  file: File;
  preview: string;
  progress: number;
  url?: string;
  error?: boolean;
}

interface PhotoUploadStepProps {
  onComplete: (photoUrls: string[]) => void;
  onBack: () => void;
}

export function PhotoUploadStep({ onComplete, onBack }: PhotoUploadStepProps) {
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadedUrls = files
    .filter((f) => f.url && !f.error)
    .map((f) => f.url!);
  const isUploading = files.some((f) => !f.url && !f.error);
  const canAddMore = files.length < MAX_FILES;

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("files", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.urls[0];
  }, []);

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `${file.name} is not a supported image format. Please use JPEG, PNG, or WebP.`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name} exceeds the 5MB size limit.`;
    }
    return null;
  }

  async function handleFileSelection(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Reset input so the same file can be re-selected
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    const remaining = MAX_FILES - files.length;
    const filesToProcess = selectedFiles.slice(0, remaining);

    if (selectedFiles.length > remaining) {
      toast.error(`You can only upload ${MAX_FILES} photos total.`);
    }

    // Validate all files first
    const validFiles: File[] = [];
    for (const file of filesToProcess) {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    // Create upload entries with previews
    const newEntries: UploadingFile[] = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newEntries]);

    // Upload each file
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const entryIndex = files.length + i;

      try {
        // Simulate progress start
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === entryIndex ? { ...f, progress: 50 } : f
          )
        );

        const url = await uploadFile(file);

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === entryIndex ? { ...f, progress: 100, url } : f
          )
        );
      } catch {
        toast.error(`Failed to upload ${file.name}. Please try again.`);
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === entryIndex ? { ...f, error: true, progress: 0 } : f
          )
        );
      }
    }
  }

  function handleRemove(index: number) {
    setFiles((prev) => {
      const file = prev[index];
      URL.revokeObjectURL(file.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Add Photos</h2>
        <p className="text-sm text-muted-foreground">
          Optionally add up to {MAX_FILES} photos of your symptom. This can
          help track visual changes over time.
        </p>
      </div>

      {/* Photo thumbnails */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {files.map((file, index) => (
            <div
              key={file.preview}
              className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={file.preview}
                alt={`Symptom photo ${index + 1}`}
                className="h-full w-full object-cover"
              />

              {/* Upload progress overlay */}
              {!file.url && !file.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="size-6 animate-spin text-white" />
                </div>
              )}

              {/* Error overlay */}
              {file.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="text-xs font-medium text-destructive">
                    Failed
                  </span>
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                aria-label={`Remove photo ${index + 1}`}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelection}
      />

      {/* Add photos button */}
      {canAddMore && (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="min-h-[44px] w-full"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {files.length === 0 ? (
            <>
              <Camera className="size-4" />
              Add Photos
            </>
          ) : (
            <>
              <ImagePlus className="size-4" />
              Add More ({files.length}/{MAX_FILES})
            </>
          )}
        </Button>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        {uploadedUrls.length > 0 ? (
          <Button
            size="lg"
            className="min-h-[44px] w-full"
            disabled={isUploading}
            onClick={() => onComplete(uploadedUrls)}
          >
            {isUploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading...
              </>
            ) : (
              `Continue with ${uploadedUrls.length} photo${uploadedUrls.length !== 1 ? "s" : ""}`
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="lg"
            className="min-h-[44px] w-full"
            onClick={() => onComplete([])}
            disabled={isUploading}
          >
            Skip
          </Button>
        )}
      </div>

      <Button
        variant="ghost"
        onClick={onBack}
        className="min-h-[44px] text-muted-foreground"
        size="lg"
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>
    </div>
  );
}
