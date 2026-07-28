import { Link } from "@tanstack/react-router";
import { Container } from "#/components/container";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-0.5 pointer-events-none">
      <Container className="flex items-center justify-between w-full max-w-6xl mx-auto pointer-events-auto">
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src="/icon.svg" alt="Lang Clips Logo" className="w-6 h-6" />
          <span className="font-caveat font-bold text-xl tracking-wide">
            Lang Clips
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link
            to="/"
            className="text-white/60 hover:text-white transition-colors [&.active]:text-white [&.active]:font-semibold"
          >
            Home
          </Link>
          <Link
            to="/decks"
            className="text-white/60 hover:text-white transition-colors [&.active]:text-white [&.active]:font-semibold"
          >
            My Decks
          </Link>
        </nav>
      </Container>
    </header>
  );
}
