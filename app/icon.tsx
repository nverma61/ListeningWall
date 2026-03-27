import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #3d6b58 0%, #5a8f7a 100%)",
          color: "#faf9f7",
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        LW
      </div>
    ),
    { ...size }
  );
}
