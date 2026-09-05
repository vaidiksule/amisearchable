import { ImageResponse } from "next/og";

export const alt =
  "AI Searchable — Check if GPTBot, ClaudeBot and PerplexityBot can access your site";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0b0a",
          color: "#f4f1ea",
          padding: 72,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            color: "#a39d94",
          }}
        >
          amisearchable.cc
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 64, lineHeight: 1.1, fontWeight: 600, maxWidth: 960 }}>
            Is your site visible to AI search?
          </div>
          <div style={{ fontSize: 28, color: "#a39d94", maxWidth: 880 }}>
            Check GPTBot, ChatGPT-User, ClaudeBot, and PerplexityBot in robots.txt.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
