import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "EarthEnable Hub";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F7EDDB",
        backgroundImage: "linear-gradient(135deg, #F7EDDB 0%, #FDFCFC 100%)",
      }}
    >
      {/* Logo area */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 40,
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 24,
            backgroundColor: "#EA6A00",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 24,
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "white",
            }}
          >
            EE
          </span>
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          display: "flex",
          fontSize: 64,
          fontWeight: 700,
          color: "#78373B",
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        EarthEnable Hub
      </div>

      {/* Subtitle */}
      <div
        style={{
          display: "flex",
          fontSize: 28,
          color: "#666",
          textAlign: "center",
          maxWidth: 800,
        }}
      >
        Field Operations Management Platform
      </div>

      {/* Countries */}
      <div
        style={{
          display: "flex",
          marginTop: 40,
          gap: 16,
        }}
      >
        {["Rwanda", "Kenya", "Zambia", "India"].map((country) => (
          <div
            key={country}
            style={{
              display: "flex",
              padding: "8px 20px",
              backgroundColor: "#124D37",
              color: "white",
              borderRadius: 20,
              fontSize: 18,
            }}
          >
            {country}
          </div>
        ))}
      </div>
    </div>,
    {
      ...size,
    }
  );
}
