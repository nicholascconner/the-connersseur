import Image from 'next/image';

interface MarqueeLogoProps {
  size?: 'small' | 'medium' | 'large';
}

export default function MarqueeLogo({ size = 'large' }: MarqueeLogoProps) {
  const sizeClasses = {
    small: 'w-[240px] max-w-full',
    medium: 'w-[320px] max-w-full',
    large: 'w-[420px] max-w-full',
  };

  return (
    <div className={`${sizeClasses[size]} mx-auto`}>
      <Image
        src="/logo-connersseur.png"
        alt="The Connersseur"
        width={2360}
        height={1640}
        className="w-full h-auto"
        priority
      />
    </div>
  );
}
