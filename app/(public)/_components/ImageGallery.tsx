"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, X } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

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

export default function ImageGallery({ images, title = "Gallery" }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    if (!selectedImage) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedImage]);

  return (
    <section className="py-12 md:py-16">
      {title && <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{title}</h2>}

      {/* Thumbnail Grid */}
      <RevealGroup className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {images.map((image) => (
          <RevealItem key={image.id}>
            <button
              onClick={() => setSelectedImage(image)}
              aria-label={image.caption ? `View photo: ${image.caption}` : "View photo"}
              className="relative w-full h-40 sm:h-48 bg-gray-200 dark:bg-white/10 rounded-xl overflow-hidden transition-transform hover:scale-[1.02] group"
            >
              <div className="w-full h-full bg-linear-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                <Camera className="w-10 h-10 text-white/50" aria-hidden="true" />
              </div>
              {image.caption && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end p-3">
                  <p className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {image.caption}
                  </p>
                </div>
              )}
            </button>
          </RevealItem>
        ))}
      </RevealGroup>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={selectedImage.caption ?? "Photo"}
            className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
                <button
                  onClick={() => setSelectedImage(null)}
                  aria-label="Close"
                  autoFocus
                  className="absolute top-4 right-4 bg-white dark:bg-gray-900 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-white/5 z-10"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>

                {/* Placeholder for image */}
                <div className="bg-linear-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800 h-96 sm:h-125 flex items-center justify-center">
                  <Camera className="w-20 h-20 text-white/40" aria-hidden="true" />
                </div>

                {selectedImage.caption && (
                  <div className="p-6 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-white/10">
                    <p className="text-gray-800 dark:text-gray-100 font-semibold">{selectedImage.caption}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
