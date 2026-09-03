"use client";

import { useState } from "react";

interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  title?: string;
}

export default function ImageGallery({
  images,
  title = "Gallery",
}: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  return (
    <section className="py-12 md:py-16">
      {title && (
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {title}
        </h2>
      )}

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(image)}
            className="relative h-40 sm:h-48 bg-gray-200 rounded-lg overflow-hidden hover:opacity-80 transition group"
          >
            <div className="w-full h-full bg-linear-to-br from-gray-300 to-gray-400 flex items-center justify-center">
              <span className="text-4xl opacity-40">🏸</span>
            </div>
            {image.caption && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-end p-3">
                <p className="text-white text-sm font-semibold group-hover:visible">
                  {image.caption}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative bg-white rounded-lg overflow-hidden">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 z-10"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Placeholder for image */}
              <div className="bg-linear-to-br from-gray-300 to-gray-400 h-96 sm:h-[500px] flex items-center justify-center">
                <span className="text-8xl opacity-20">🏸</span>
              </div>

              {selectedImage.caption && (
                <div className="p-6 bg-gray-50 border-t">
                  <p className="text-gray-800 font-semibold">
                    {selectedImage.caption}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
