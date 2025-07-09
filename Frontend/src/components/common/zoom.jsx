import React, { useState, useRef } from "react";

const ImageMagnifier = ({ src, zoom = 2, size = 150 }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const handleMouseMove = (e) => {
    const bounds = imageRef.current.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    setCursor({ x, y });
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      style={{ width: "400px", height: "400px" }}
    >
      <img
        ref={imageRef}
        src={src}
        alt="Zoomed Product"
        className="w-full h-full object-contain"
      />

      {isHovering && (
        <div
          className="absolute pointer-events-none rounded-full border-2 border-gray-300"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            top: `${cursor.y - size / 2}px`,
            left: `${cursor.x - size / 2}px`,
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${400 * zoom}px ${400 * zoom}px`,
            backgroundPosition: `-${cursor.x * zoom - size / 2}px -${
              cursor.y * zoom - size / 2
            }px`,
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};

export default ImageMagnifier;