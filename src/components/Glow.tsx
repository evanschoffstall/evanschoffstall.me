import { cn } from "@/shared";

/**
 * Optional class overrides for the decorative glow layer rendered behind cards.
 */
interface Props {
  className?: string;
}

/**
 * Renders the blurred background glow used behind interactive cards.
 * @param props - The optional class name overrides for the glow wrapper.
 * @returns The decorative glow element.
 */
export function Glow(props: Props) {
  const { className } = props;

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
