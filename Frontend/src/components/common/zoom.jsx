import React, { useState, useRef } from "react";

const ImageMagnifier = ({ src, zoom = 2, size = 160 }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [bounds, setBounds] = useState({ width: 400, height: 400 });
  const imageRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    setBounds({ width: rect.width, height: rect.height });
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCursor({ x, y });
  };

  return (
    <div
      className="relative w-full max-w-[420px] aspect-square flex items-center justify-center cursor-crosshair overflow-hidden select-none"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        ref={imageRef}
        src={src}
        alt="Product View"
        className="w-full h-full object-contain filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.8)]"
      />

      {isHovering && (
        <div
          className="absolute pointer-events-none rounded-full border-2 border-amber-400 shadow-[0_0_20px_rgba(212,175,55,0.4)] hidden sm:block"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            top: `${cursor.y - size / 2}px`,
            left: `${cursor.x - size / 2}px`,
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${bounds.width * zoom}px ${bounds.height * zoom}px`,
            backgroundPosition: `-${cursor.x * zoom - size / 2}px -${
              cursor.y * zoom - size / 2
            }px`,
            zIndex: 20,
          }}
        />
      )}
    </div>
  );
};

export default ImageMagnifier;