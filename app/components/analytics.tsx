"use client";

export function Analytics() {
	return (
		<>
			<script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTM_ID}`}></script>
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
		</>
	)
}