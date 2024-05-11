"use client";

export function Analytics() {
	return (
		<script
			dangerouslySetInnerHTML={{
				__html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${process.env.NEXT_PUBLIC_GTM_ID}');
    `,
			}}
		/>
	)
}