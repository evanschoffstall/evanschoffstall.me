import Particles from "./components/particles";
import { HomeContent } from "./components/home-content";

export default function Home() {
  return (
    <div className="relative w-full min-h-screen">
      <div className="fixed inset-0 -z-20 bg-gradient-to-tl from-black via-zinc-600/20 to-black" />
      <Particles className="fixed inset-0 -z-10 animate-fade-in" quantity={200} />
      <HomeContent />
    </div>
  );
}
