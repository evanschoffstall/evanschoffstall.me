"use client";
import { useIsIntersecting } from "@/app/hooks/use-is-intersecting";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = {
	href?: string;
	onBack?: () => void;
};

export function Navigation({ href = "/", onBack }: Props) {
	const { ref, isIntersecting } = useIsIntersecting<HTMLElement>();

	return (
		<header ref={ref}>
			<div
				className={`fixed inset-x-0 top-0 z-50 backdrop-blur  duration-200 border-b  ${isIntersecting
					? "bg-zinc-900/0 border-transparent"
					: "bg-zinc-900/50  border-zinc-800 "
					}`}
			>
				<div className="flex flex-row items-center justify-between p-4">
					{onBack ? (
						<button
							type="button"
							onClick={onBack}
							className="duration-200 text-zinc-300 hover:text-zinc-100"
							aria-label="Back"
						>
							<ArrowLeft className="w-6 h-6 " />
						</button>
					) : (
						<Link
							href={href}
							className="duration-200 text-zinc-300 hover:text-zinc-100">
							<ArrowLeft className="w-6 h-6 " />
						</Link>
					)}
				</div>
			</div>
		</header>
	);
}
