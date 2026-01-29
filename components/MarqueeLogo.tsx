'use client';

interface MarqueeLogoProps {
  size?: 'small' | 'medium' | 'large';
}

export default function MarqueeLogo({ size = 'large' }: MarqueeLogoProps) {
  // Responsive: use max-w to constrain on mobile, scale down text accordingly
  const sizeClasses = {
    small: 'w-[280px] max-w-full h-auto aspect-[280/120]',
    medium: 'w-[340px] max-w-full h-auto aspect-[340/145]',
    large: 'w-[420px] max-w-full h-auto aspect-[420/180]',
  };

  const textSizes = {
    small: {
      the: 'text-[18px] tracking-[4px] md:text-[18px]',
      main: 'text-[32px] md:text-[38px]',
      olive: 'text-[16px] md:text-[18px] top-[2px] md:top-[4px] right-[28px] md:right-[35px]'
    },
    medium: {
      the: 'text-[18px] tracking-[4px] md:text-[22px] md:tracking-[5px]',
      main: 'text-[36px] md:text-[46px]',
      olive: 'text-[18px] md:text-[22px] top-[3px] md:top-[5px] right-[35px] md:right-[45px]'
    },
    large: {
      the: 'text-[18px] tracking-[4px] md:text-[28px] md:tracking-[8px]',
      main: 'text-[36px] md:text-[58px]',
      olive: 'text-[18px] md:text-[28px] top-[3px] md:top-[6px] right-[35px] md:right-[55px]'
    },
  };

  const lightPositions = {
    // Top edge
    top: [
      { top: '14%', left: '12%' },
      { top: '7%', left: '19%' },
      { top: '3%', left: '27%' },
      { top: '0%', left: '36%' },
      { top: '-1%', left: '44%' },
      { top: '-2%', left: '52%' },
      { top: '-1%', left: '61%' },
      { top: '0%', left: '69%' },
      { top: '3%', left: '77%' },
      { top: '7%', left: '85%' },
      { top: '14%', left: '92%' },
    ],
    // Bottom edge
    bottom: [
      { bottom: '14%', left: '12%' },
      { bottom: '7%', left: '19%' },
      { bottom: '3%', left: '27%' },
      { bottom: '0%', left: '36%' },
      { bottom: '-1%', left: '44%' },
      { bottom: '-2%', left: '52%' },
      { bottom: '-1%', left: '61%' },
      { bottom: '0%', left: '69%' },
      { bottom: '3%', left: '77%' },
      { bottom: '7%', left: '85%' },
      { bottom: '14%', left: '92%' },
    ],
    // Left edge
    left: [
      { top: '31%', left: '6%' },
      { top: '50%', left: '3%' },
      { top: '69%', left: '6%' },
    ],
    // Right edge
    right: [
      { top: '31%', right: '6%' },
      { top: '50%', right: '3%' },
      { top: '69%', right: '6%' },
    ],
  };

  const allLights = [
    ...lightPositions.top,
    ...lightPositions.bottom,
    ...lightPositions.left,
    ...lightPositions.right,
  ];

  return (
    <div className={`relative ${sizeClasses[size]} mx-auto`}>
      {/* Lights container */}
      <div className="absolute inset-[-8px] pointer-events-none">
        {allLights.map((pos, i) => (
          <div
            key={i}
            className="marquee-light absolute w-3 h-3 rounded-full"
            style={{
              ...pos,
              animationDelay: `${(i * 0.1) % 1.5}s`,
            }}
          />
        ))}
      </div>

      {/* The sign */}
      <div className="marquee-sign w-full h-full flex flex-col items-center justify-center">
        <div
          className={`font-extrabold text-white uppercase ${textSizes[size].the}`}
          style={{ marginBottom: '-5px', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
        >
          THE
        </div>
        <div
          className={`font-pacifico text-white relative ${textSizes[size].main}`}
          style={{ textShadow: '0 3px 6px rgba(0,0,0,0.3)' }}
        >
          Connersseur
          <span
            className={`absolute ${textSizes[size].olive}`}
            style={{ transform: 'rotate(15deg)' }}
          >
            🫒
          </span>
        </div>
      </div>
    </div>
  );
}
