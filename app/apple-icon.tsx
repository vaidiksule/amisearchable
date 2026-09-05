import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0D10",
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 36,
            background: "#34D399",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <svg width="88" height="88" viewBox="0 0 64 64">
            <path
              d="M16 33 L27 44 L48 20"
              stroke="#0B0D10"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
    ),
    { ...size },
  );
}
