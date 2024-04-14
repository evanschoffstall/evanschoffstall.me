'use client';

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Particles from "./components/particles";

const navigation = [
  { name: "Projects", href: "/projects" },
  { name: "Contact", href: "/contact" },
];

export default function Home() {
  const bioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bioRef.current) {
      console.log("Applying class changes to bioRef");
      bioRef.current.classList.remove('opacity-0', '-translate-y-1/2');
    }
  }, []);

  return (
    <div className="relative w-screen h-screen bg-gradient-to-tl from-black via-zinc-600/20 to-black">
      <Particles className="absolute inset-0 -z-10 animate-fade-in" quantity={200} />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Navigation />
        <Title />
        <Tagline />
        <Bio bioRef={bioRef} />
      </div>
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
        Web & Software Developer with 10 Years of Expertise in Business, Service, Product: Development, Management, & Execution
      </h2>
      <h2 className="mt-4 text-zinc-300">
        I'm building{" "}
        <Link
          target="_blank"
          href="https://librerss.com"
          className="underline duration-500 hover:text-zinc-500"
        >
          librerss.com
        </Link>{" "}
        to revive an extant tradition of free cloud rss access.
      </h2>
    </div>
  );
}

function Bio({ bioRef }: { bioRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div
      ref={bioRef}
      className="bio opacity-0 ease-in-out md:mt-10"
      style={{ transition: 'transform 1800ms ease-in-out, opacity 1800ms ease-in-out', transitionDelay: '1800ms' }}>
      <div className="flex flex-col md:flex-row items-center justify-center h-full">
        <span className="relative z-10 max-w-[200px] flex items-center justify-center md:ml-20 md:mr-5 2xl:ml-96">
          <img src="/pfp.png" alt="Profile" />
        </span>
        <div className="mb-10 duration-1000 text-xs sm:text-sm md:text-base mt-10 md:mt-0 px-20 md:px-0 flex items-center justify-center md:mr-20 2xl:mr-96">
          <div className="md:text-left text-center">
            <div>
              <h2 className="text-zinc-300">
                <strong>Founder & Lead Developer of Librerss,</strong> a modernized, cloud-native revival of free cloud news aggregation, with a background in both cloud and on-premises web and software development, and IT.
              </h2>
              <br></br>
              <h2 className="text-zinc-300">
                <strong>With over a decade of experience spanning business development, management, and execution,</strong> I have taken leadership roles that include bringing a brewery and distillery from concept to market. This cross-industry expertise is evident in my ability to adapt and innovate, underscoring my tenure in technology and product development.
              </h2>
              <br></br>
              <h2 className="text-zinc-300">
                <strong>Currently overseeing operations as Distillery Manager, Vineyard Manager, and Senior Operations Officer,</strong> I leverage my diverse skill set to develop, grow, and enhance business, product, and services across multiple facets of industry.
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
