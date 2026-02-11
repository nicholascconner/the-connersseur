'use client';

import Image from 'next/image';

interface MarqueeLogoProps {
  size?: 'small' | 'medium' | 'large';
}

// Dot positions (% of image dimensions) derived from pixel analysis of the logo
// Ordered clockwise starting from left-middle, going up
const DOT_POSITIONS = [
  // Left side (ascending)
  { top: 50, left: 7 },
  { top: 45.3, left: 7.2 },
  { top: 42.2, left: 7.3 },
  { top: 39, left: 7.1 },
  { top: 35.9, left: 7 },
  { top: 32.6, left: 6.9 },
  { top: 29.1, left: 6.8 },
  { top: 25.5, left: 6.9 },
  { top: 22.5, left: 7.3 },
  // Top-left curve
  { top: 17.4, left: 8.9 },
  { top: 13.8, left: 10.7 },
  { top: 11.3, left: 12.5 },
  { top: 9.5, left: 15.3 },
  // Top
  { top: 6.8, left: 19.1 },
  { top: 6.7, left: 23.3 },
  { top: 7.3, left: 27.2 },
  // Top-right descent
  { top: 10.1, left: 32 },
  { top: 14.1, left: 36.7 },
  { top: 17.6, left: 39.9 },
  { top: 20.8, left: 42.4 },
  { top: 23.8, left: 44.6 },
  { top: 27.6, left: 48.4 },
  { top: 30.5, left: 51.6 },
  // Right flat section
  { top: 32, left: 56.3 },
  { top: 33.3, left: 60.9 },
  { top: 33.5, left: 65.8 },
  { top: 33.5, left: 70 },
  { top: 33.3, left: 74.2 },
  { top: 33.1, left: 78.7 },
  { top: 32.7, left: 83 },
  { top: 32.5, left: 88.7 },
  // Right curve (descending)
  { top: 34.7, left: 91.1 },
  { top: 38.1, left: 94.2 },
  { top: 41.5, left: 95.3 },
  { top: 44.8, left: 95.5 },
  { top: 47.9, left: 95.6 },
  { top: 51.3, left: 95.4 },
  { top: 55, left: 94.6 },
  { top: 59.5, left: 93.4 },
  { top: 62.3, left: 92.3 },
  { top: 65.3, left: 90.7 },
  { top: 68.6, left: 88.4 },
  { top: 70.8, left: 86 },
  // Bottom-right
  { top: 73.4, left: 81.7 },
  { top: 73.7, left: 76.5 },
  { top: 73.6, left: 71.9 },
  { top: 73.6, left: 67.9 },
  { top: 73.4, left: 62.4 },
  { top: 72.4, left: 57.9 },
  { top: 70.7, left: 53.5 },
  { top: 70.1, left: 50.2 },
  // Bottom
  { top: 69.3, left: 46.1 },
  { top: 69.3, left: 41.6 },
  { top: 70.2, left: 37 },
  { top: 70.9, left: 33.1 },
  // Bottom-left curve
  { top: 73.5, left: 28 },
  { top: 74.6, left: 24.1 },
  { top: 77.6, left: 19.4 },
  { top: 80.3, left: 14.1 },
  { top: 80.4, left: 8.7 },
  // Left-bottom
  { top: 79.8, left: 6.1 },
  { top: 78.6, left: 4.5 },
  { top: 75.6, left: 3.9 },
  { top: 71.5, left: 3.3 },
  { top: 66.5, left: 3.3 },
  { top: 61.1, left: 4.5 },
  { top: 58.4, left: 5.6 },
  { top: 54.7, left: 6.8 },
];

export default function MarqueeLogo({ size = 'large' }: MarqueeLogoProps) {
  const sizeClasses = {
    small: 'w-[240px] max-w-full',
    medium: 'w-[320px] max-w-full',
    large: 'w-[420px] max-w-full',
  };

  const dotSize = {
    small: 4,
    medium: 5,
    large: 7,
  };

  return (
    <div className={`relative ${sizeClasses[size]} mx-auto`}>
      <Image
        src="/logo-connersseur.png"
        alt="The Connersseur"
        width={2360}
        height={1640}
        className="w-full h-auto"
        priority
      />
      {/* Animated light overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {DOT_POSITIONS.map((pos, i) => (
          <div
            key={i}
            className="marquee-light absolute rounded-full"
            style={{
              top: `${pos.top}%`,
              left: `${pos.left}%`,
              width: dotSize[size],
              height: dotSize[size],
              transform: 'translate(-50%, -50%)',
              animationDelay: `${(i * 0.06) % 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
