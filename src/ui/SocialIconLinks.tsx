import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";

import {
  Code2,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";

/** Shared icon contract for Lucide UI icons and brand icon components. */
interface SocialLink {
  href: string;
  Icon: IconType | LucideIcon;
  label: string;
}

/** Shared visual treatment for social and profile icon links. */
export const iconButtonClassName = `
  flex size-6 items-center justify-center rounded-full border border-zinc-800
  bg-zinc-900/40 text-zinc-500 transition-all duration-200
  hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-200
  sm:size-7
`;

/** Generic repository icon used for repo CTAs outside the social row. */
export const RepositoryIcon = Code2;

const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    href: "https://github.com/evanschoffstall",
    Icon: FaGithub,
    label: "GitHub",
  },
  {
    href: "https://www.linkedin.com/in/evan-schoffstall-2a9531163/",
    Icon: FaLinkedin,
    label: "LinkedIn",
  },
  {
    href: "https://twitter.com/evnschoffstall",
    Icon: FaXTwitter,
    label: "X (Twitter)",
  },
  {
    href: "mailto:hello@evanschoffstall.me",
    Icon: Mail,
    label: "Email",
  },
] as const;

interface SocialIconLinksProps {
  className?: string;
}

/** Shared social link row used by the home, projects, and detail nav surfaces. */
export function SocialIconLinks({
  className = "flex items-center gap-1",
}: SocialIconLinksProps) {
  return (
    <div className={className}>
      {SOCIAL_LINKS.map(({ href, Icon, label }) => (
        <Link
          aria-label={label}
          className={iconButtonClassName}
          href={href}
          key={label}
          rel="noopener noreferrer"
          target="_blank"
        >
          <Icon className="size-3" />
        </Link>
      ))}
    </div>
  );
}