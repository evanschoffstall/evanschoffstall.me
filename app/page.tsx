import React from "react";
import Link from "next/link";
import Particles from "./components/particles";

const navigation = [
  { name: "Projects", href: "/projects" },
  { name: "Contact", href: "/contact" },
];

export default function Home() {
  return (
    <div
      className="flex flex-col items-center sm:justify-start pt-4 relative w-screen min-h-screen bg-gradient-to-tl from-black via-zinc-600/20 to-black lg:flex lg:items-center lg:justify-center">
      <Particles className="absolute inset-0 -z-10 animate-fade-in" quantity={200} />
      <Navigation />
      <Title />
      <Tagline />
      <Bio />
    </div>
  );
}

function Navigation() {
  return (
    <nav className="my-16 animate-fade-in">
      <ul className="flex items-center justify-center gap-4">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm duration-500 text-zinc-300 hover:text-zinc-500">
            {item.name}
          </Link>
        ))}
      </ul>
    </nav>
  );
}

function Title() {
  return (
    <h1 className="z-10 text-4xl text-transparent bg-white cursor-default text-edge-outline animate-title font-display sm:text-6xl md:text-7xl lg:text-9xl whitespace-nowrap bg-clip-text">
      Evan Schoffstall
    </h1>
  );
}

function Tagline() {
  return (
    <div className="mt-5 px-20 duration-1000 text-xs sm:text-sm md:text-base mb-10 text-center animate-fade-in">
      <h2 className="text-zinc-300">
        15+ Year Web & Software Engineer With Enriched Experience
      </h2>
      <h2 className="mt-4 text-zinc-300">
        I'm building{" "}
        <Link
          target="_blank"
          href="https://librerss.com"
          className="underline duration-500 hover:text-zinc-500"  >
          librerss.com
        </Link>{" "}
        to revive an extant tradition of free cloud rss access.
      </h2>
    </div>
  );
}

function Bio() {
  return (
    <div
      className="bio animate-fade-in-up ease-in-out md:mt-10">
      <div className="flex flex-col md:flex-row items-center justify-center h-full">
        <span className="relative z-10 max-w-[200px] flex items-center justify-center md:ml-20 md:mr-5 2xl:ml-96">
          <img src="/pfp.png" alt="Profile" />
        </span>
        <div className="mb-10 duration-1000 text-xs sm:text-sm md:text-base mt-10 md:mt-0 px-20 md:px-0 flex items-center justify-center md:mr-20 2xl:mr-96">
          <div className="md:text-left text-center">
            <div>
              <h2 className="text-zinc-300">
                <strong>Over 15 years in web & software engineering</strong> and over a decade ground floor to executive, enriched multi-industry experience in every way.
              </h2>
              <br></br>
              <h2 className="text-zinc-300">
                <strong>Certified & professional technical expertise that spans a wide range of programming languages and frameworks</strong>, such as Java, Python, C# JavaScript, Bash, Powershell, and more, alongside profound knowledge in web and server-side technologies such as Node.js, Next.js, PHP, SQL, and more.
              </h2>
              <br></br>
              <h2 className="text-zinc-300">
                <strong>Founder & Lead Developer of LibreRSS</strong>, a revival of the extant tradition of free cloud news aggregation.
              </h2>
              <br></br>
              <h2 className="text-zinc-300">
                <strong>Extensive history both working with and serving</strong> others, be it users, employees, employers, clients, customers and guests alike.
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}