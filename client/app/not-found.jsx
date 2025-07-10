import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center text-white bg-[#121212]">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">404 - Not Found</h1>
      <p className="text-lg text-gray-400 mb-6">Looks like you’re lost in space.</p>
      <Link
        href="/"
        className="text-[#00FF89] hover:underline text-lg transition-all"
      >
        🏠 Go back home
      </Link>
    </div>
  );
}
