"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageCarousel({ imageUrls }: { imageUrls: string[] }) {
  const [current, setCurrent] = useState(0);

  function prev() {
    setCurrent((i) => (i === 0 ? imageUrls.length - 1 : i - 1));
  }

  function next() {
    setCurrent((i) => (i === imageUrls.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="relative h-72 w-full bg-gray-100">
      <Image
        src={imageUrls[current]}
        alt={`image ${current + 1}`}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-contain"
      />

      {imageUrls.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-60"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-60"
          >
            ›
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {imageUrls.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full ${
                  i === current ? "bg-white" : "bg-white bg-opacity-50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
