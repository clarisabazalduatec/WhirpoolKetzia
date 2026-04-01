import Link from 'next/link';

export default function Header() {
  return (
    <header className="h-20 lg:h-32 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center px-6 lg:px-8 sticky top-0 z-40 w-full transition-all duration-300">
      <div className="flex items-center justify-center lg:justify-start w-full gap-2 p-1">
        <Link href="/" className="hover:opacity-80 transition-opacity">
            <img 
                src="https://www.whirlpoolcorp.com/content/dam/business-unit/whirlpoolcorp/wp-content/upload/logos/2021_Whirlpool_Corp_2C_Black_RGB.png" 
                alt="Whirlpool Logo" 
                className="h-10 lg:h-16 w-auto object-contain transition-all duration-300" 
            />
        </Link>
      </div>
    </header>
  );
}