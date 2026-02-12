"use client";

import { useEffect } from "react";


export function ReportView({ slug }: { slug: string }) {
	useEffect(() => {
		void fetch("/api/incr", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ slug }),
		});
	}, [slug]);

	return null;
}
