import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Trend } from "dexcom-share";
import { Syringe } from "lucide-react";
import satori, { type SatoriOptions } from "satori";
import { TrendIcon } from "@/components/trend-icon";
import { getDelta } from "@/lib/delta";

const geistFontPath = join(
	process.cwd(),
	"node_modules/geist/dist/fonts/geist-mono/GeistMono-SemiBold.ttf",
);
const geistFont = readFileSync(geistFontPath);

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);

	const satoriOptions: SatoriOptions = {
		width: 32,
		height: 32,
		fonts: [{ name: "Geist", data: geistFont, weight: 400, style: "normal" }],
	};

	if (searchParams.size === 0) {
		const svg = await satori(
			<Syringe
				width={32}
				height={32}
				stroke="white"
				filter="drop-shadow(0 0 2px rgba(0, 0, 0, 1))"
			/>,
			satoriOptions,
		);
		return new Response(svg, {
			headers: {
				"Content-Type": "image/svg+xml",
			},
		});
	}

	const bgl = parseInt(searchParams.get("bgl") ?? "0", 10);
	if (Number.isNaN(bgl) || bgl < 0 || bgl > 1000) {
		return new Response("Invalid bgl", { status: 400 });
	}

	const delta = parseInt(searchParams.get("delta") ?? "0", 10);
	if (Number.isNaN(delta) || delta < -1000 || delta > 1000) {
		return new Response("Invalid delta", { status: 400 });
	}
	const deltaStr = getDelta(delta);

	const trend = searchParams.get("trend");
	if (!trend) {
		return new Response("Invalid trend", { status: 400 });
	}
	const trendValue = Trend[trend as keyof typeof Trend];
	if (typeof trendValue !== "number") {
		return new Response("Invalid trend", { status: 400 });
	}

	const isDarkMode = searchParams.has("dark");
	const color = isDarkMode ? "white" : "black";
	const textShadow = isDarkMode ? "0 0 2px black" : "0 0 2px white";

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
					gap: deltaStr.length > 2 ? 0 : 4,
				}}
			>
				<span>
					<TrendIcon
						trend={trendValue}
						width={12}
						height={12}
						stroke={color}
						style={{ filter: `drop-shadow(${textShadow})` }}
					/>
				</span>
				<span>{deltaStr}</span>
			</div>
		</div>,
		satoriOptions,
	);

	return new Response(svg, {
		headers: {
			"Content-Type": "image/svg+xml",
		},
	});
}
