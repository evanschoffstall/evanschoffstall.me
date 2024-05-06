"use client";
import { useEffect } from 'react';
import TagManager from 'react-gtm-module';

export function Analytics() {
	const GTM_ID = "GTM-W9FBFT4R"

	useEffect(() => {
		if (typeof window !== 'undefined' && GTM_ID) {
			const TagManager = require('react-gtm-module');
			TagManager.initialize({ gtmId: GTM_ID });
		}
	}, []);

	return null;
}