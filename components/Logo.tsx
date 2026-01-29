import MarqueeLogo from './MarqueeLogo';

export default function Logo() {
  return (
    <header className="header-gradient py-10 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <MarqueeLogo size="large" />
        <p className="text-white/80 font-semibold mt-4 text-lg">
          Crafted Cocktails, Conner Style
        </p>
      </div>
    </header>
  );
}
