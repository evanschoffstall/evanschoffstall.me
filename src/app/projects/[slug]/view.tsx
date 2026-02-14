"use client";

import { useEffect } from "react";


export function ReportView({ slug }: { slug: string }) {
	useEffect(() => {
		void fetch("/api/incr", {
			method: "POST",
			keepalive: true,
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ slug }),
		}).catch(() => {
			// ignore analytics reporting failures
		});
	}, [slug]);

	return null;
}
