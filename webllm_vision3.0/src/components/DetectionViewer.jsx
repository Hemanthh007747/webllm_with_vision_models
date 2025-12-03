import React, { useRef, useEffect } from "react";

/*
  Left: Original preview.
  Right: Detection canvas (shows boxes) + color legend.
*/
export default function DetectionViewer({ inputImage, outputCanvas }) {
  const leftRef = useRef();

  useEffect(() => {
    // cleanup object URLs on unmount
    return () => {
      if (inputImage && inputImage.startsWith("blob:")) {
        URL.revokeObjectURL(inputImage);
      }
    };
  }, [inputImage]);

  // legend colors (same as in inference.js)
  const legend = [
    { color: "#00ff88", label: "Person" },
    { color: "#ff0077", label: "Cell phone" },
    { color: "#ffaa00", label: "Book / Dictionary" },
    { color: "#00aaff", label: "Bags (Backpack / Handbag / Suitcase)" },
    { color: "#aaff00", label: "Bottle" },
    { color: "#ff44ff", label: "Electronic Items (TV / Laptop / Mouse / Keyboard / Remote)" },
  ];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      {/* Left: Original */}
      <div style={{ flex: "1 1 45%" }}>
        <h3>Original</h3>
        {inputImage ? (
          <img
            ref={leftRef}
            src={inputImage}
            alt="input"
            style={{
              width: "100%",
              borderRadius: 8,
              border: "1px solid #ccc",
              boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            }}
          />
        ) : (
          <div style={{ color: "#666", textAlign: "center", marginTop: 40 }}>
            No image selected
          </div>
        )}
      </div>

      {/* Right: Detection result */}
      <div style={{ flex: "1 1 45%" }}>
        <h3>Detection</h3>
        {outputCanvas ? (
          <div
            dangerouslySetInnerHTML={{ __html: outputCanvas.outerHTML }}
            style={{
              width: "100%",
              borderRadius: 8,
              border: "1px solid #ccc",
              boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
            }}
          />
        ) : (
          <div style={{ color: "#666", textAlign: "center", marginTop: 40 }}>
            No detection yet
          </div>
        )}

        {/* Color legend */}
        <div
          style={{
            marginTop: 16,
            padding: "10px 14px",
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#f8f8f8",
          }}
        >
          <h4 style={{ marginBottom: 10 }}>Legend</h4>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px 18px",
              fontSize: 14,
            }}
          >
            {legend.map((item) => (
              <div
                key={item.label}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 16,
                    height: 16,
                    background: item.color,
                    border: "1px solid #999",
                    borderRadius: 3,
                  }}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
