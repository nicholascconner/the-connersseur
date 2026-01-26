export default function Logo() {
  return (
    <div className="flex flex-col items-center py-8 px-4">
      {/* Marquee Sign Container */}
      <div className="relative bg-burgundy rounded-lg shadow-2xl border-8 border-black p-6 md:p-8 max-w-md w-full">
        {/* Decorative Bulbs - Top */}
        <div className="absolute -top-2 left-0 right-0 flex justify-around px-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={`top-${i}`}
              className="w-3 h-3 bg-gold rounded-full shadow-lg animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '2s',
              }}
            />
          ))}
        </div>

        {/* Decorative Bulbs - Bottom */}
        <div className="absolute -bottom-2 left-0 right-0 flex justify-around px-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={`bottom-${i}`}
              className="w-3 h-3 bg-gold rounded-full shadow-lg animate-pulse"
              style={{
                animationDelay: `${i * 0.2 + 0.1}s`,
                animationDuration: '2s',
              }}
            />
          ))}
        </div>

        {/* Decorative Bulbs - Left */}
        <div className="absolute -left-2 top-0 bottom-0 flex flex-col justify-around py-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={`left-${i}`}
              className="w-3 h-3 bg-gold rounded-full shadow-lg animate-pulse"
              style={{
                animationDelay: `${i * 0.25}s`,
                animationDuration: '2s',
              }}
            />
          ))}
        </div>

        {/* Decorative Bulbs - Right */}
        <div className="absolute -right-2 top-0 bottom-0 flex flex-col justify-around py-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={`right-${i}`}
              className="w-3 h-3 bg-gold rounded-full shadow-lg animate-pulse"
              style={{
                animationDelay: `${i * 0.25 + 0.15}s`,
                animationDuration: '2s',
              }}
            />
          ))}
        </div>

        {/* Sign Content */}
        <div className="text-center">
          {/* "THE" text */}
          <div className="text-cream text-xl md:text-2xl font-bold tracking-[0.3em] mb-2">
            THE
          </div>

          {/* "Connersseur" text */}
          <div className="text-gold text-4xl md:text-5xl lg:text-6xl font-script tracking-wide drop-shadow-lg">
            Connersseur
          </div>

          {/* Decorative underline */}
          <div className="mt-4 flex justify-center">
            <div className="w-32 h-0.5 bg-gold-dark opacity-70"></div>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-gray-600 text-sm md:text-base mt-4 italic">
        Crafted Cocktails, Conner Style
      </p>
    </div>
  );
}
