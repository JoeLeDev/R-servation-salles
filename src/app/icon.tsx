import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
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
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
          borderRadius: 96,
          color: "white",
          fontSize: 140,
          fontWeight: 800,
          letterSpacing: -4,
        }}
      >
        RC
      </div>
    ),
    { ...size }
  );
}
