import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "King Neon - Custom LED Neon Signs";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
  return new ImageResponse(
    // ImageResponse JSX element
    <div
      style={{
        fontSize: 128,
        background: "#09090b", // zinc-950
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 160,
            fontWeight: 900,
            color: "#fff",
            textShadow:
              "0 0 10px #ec4899, 0 0 20px #ec4899, 0 0 40px #ec4899, 0 0 80px #ec4899",
            letterSpacing: "-8px",
            marginBottom: 40,
          }}
        >
          KING NEON
        </div>
        <div
          style={{
            fontSize: 48,
            color: "#e4e4e7", // zinc-200
            letterSpacing: "-1px",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Custom LED Neon Signs
        </div>
      </div>
    </div>,
    // ImageResponse options
    {
      // For convenience, we can re-use the exported opengraph-image
      // size config to also set the ImageResponse's width and height.
      ...size,
    }
  );
}
