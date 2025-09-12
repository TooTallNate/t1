/** @type {import('next').NextConfig} */
const nextConfig = {
	outputFileTracingIncludes: {
		"/favicon.ico": [
			"./node_modules/geist/dist/fonts/geist-mono/GeistMono-SemiBold.ttf",
		],
	},
};

export default nextConfig;
