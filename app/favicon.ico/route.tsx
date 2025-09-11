import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";

const geistFontPath = join(
	process.cwd(),
	"node_modules/geist/dist/fonts/geist-mono/GeistMono-SemiBold.ttf",
);
const geistFont = readFileSync(geistFontPath);

const getTrendUnicode = (trend: string) => {
	switch (trend) {
		case "DoubleUp": // Geist Mono doesn't support ⇈
			return (
				<>
					<span>↑</span>
					<span style={{ position: "absolute", left: 3 }}>↑</span>
				</>
			);
		case "SingleUp":
			return "↑";
		case "FortyFiveUp":
			return "↗";
		case "Flat":
			return "→";
		case "FortyFiveDown":
			return "↘";
		case "SingleDown":
			return "↓";
		case "DoubleDown": // Geist Mono doesn't support ⇊
			return (
				<>
					<span>↓</span>
					<span style={{ position: "absolute", left: 3 }}>↓</span>
				</>
			);
		case "None":
			return "⇼";
		case "OutOfRange":
			return "✖︎";
		case "NotComputable":
			return "↛";
		default:
			return null;
	}
};

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);

	const bgl = parseInt(searchParams.get("bgl") ?? "0", 10);
	if (Number.isNaN(bgl) || bgl < 0 || bgl > 1000) {
		return new Response("Invalid bgl", { status: 400 });
	}

	const delta = parseInt(searchParams.get("delta") ?? "0", 10);
	if (Number.isNaN(delta) || delta < -1000 || delta > 1000) {
		return new Response("Invalid delta", { status: 400 });
	}

	const trend = searchParams.get("trend");
	if (!trend) {
		return new Response("Invalid trend", { status: 400 });
	}

	const trendUnicode = getTrendUnicode(trend);
	if (!trendUnicode) {
		return new Response("Invalid trend", { status: 400 });
	}

	const isDarkMode = searchParams.has("dark");
	const color = isDarkMode ? "white" : "black";
	const textShadow = isDarkMode
		? "0 0 1px rgba(0, 0, 0, 1)"
		: "0 0 1px rgba(255, 255, 255, 1)";

	const svg = await satori(
		<div
			style={{
				fontSize: 14,
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				textAlign: "left",
				color,
				textWrap: "balance",
				gap: 2,
				textShadow,
			}}
		>
			<span>{bgl}</span>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
					fontSize: 12,
					gap: 2,
				}}
			>
				<span>{trendUnicode}</span>
				<span>
					{delta === 0 ? `±${delta}` : delta > 0 ? `+${delta}` : delta}
				</span>
			</div>
		</div>,
		{
			width: 32,
			height: 32,
			fonts: [
				{
					name: "Geist",
					data: geistFont,
					weight: 400,
					style: "normal",
				},
			],
		},
	);

	return new Response(svg, {
		headers: {
			"Content-Type": "image/svg+xml",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
}
