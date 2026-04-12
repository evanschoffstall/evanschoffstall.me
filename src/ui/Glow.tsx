import { cn } from "@/lib";

interface Props {
  className?: string;
}

export function Glow({ className }: Props) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        `
          absolute inset-0 rounded-lg bg-gradient-to-br from-zinc-800/20
          via-transparent to-zinc-700/20 blur-xl
        `,
        className,
      )}
    />
  );
}
