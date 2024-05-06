"use client";
import { useEffect } from 'react';
import TagManager from 'react-gtm-module';

export function Analytics() {
	const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

	useEffect(() => {
		if (typeof window !== 'undefined' && GTM_ID) {
			const TagManager = require('react-gtm-module');
			TagManager.initialize({ gtmId: GTM_ID });
		}
	}, []);

	return null;
}