import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "JFS Wears | Premium Nigerian Fashion";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: "black",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "linear-gradient(to bottom right, #1a1a1a, #000000)",
            zIndex: -1,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 40, opacity: 0.8, letterSpacing: 4 }}>JFS WEARS</div>
          <div
            style={{
              fontSize: 80,
              fontWeight: "bold",
              textAlign: "center",
              background: "linear-gradient(to right, #fff, #888)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Premium Nigerian Fashion
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
