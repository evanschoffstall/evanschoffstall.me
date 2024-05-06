"use client";
import { useEffect } from 'react';
import TagManager from 'react-gtm-module';

export function Analytics() {

	useEffect(() => {
		if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GTM_ID) {
			const TagManager = require('react-gtm-module');
			TagManager.initialize({ gtmId: process.env.NEXT_PUBLIC_GTM_ID });
		}
	}, []);

	return null;
}