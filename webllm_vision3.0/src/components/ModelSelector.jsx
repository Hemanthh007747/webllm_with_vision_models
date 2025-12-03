import React from "react";

export default function ModelSelector({ selected, onChange, options }) {
  const modelOptions = options || [
    { label: "YOLOv10 Medium (RECOMMENDED) - Fast & Accurate", value: "Xenova/yolov10-medium" },
    { label: "YOLOv10 Small - Faster", value: "Xenova/yolov10-small" },
    { label: "YOLOv10 Large - More Accurate", value: "Xenova/yolov10-large" },
    { label: "YOLOv8 Medium", value: "Xenova/yolov8-medium" },
    { label: "YOLOv8 Small", value: "Xenova/yolov8-small" },
  ];

  const handleSelect = (e) => {
    onChange(e.target.value);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <label htmlFor="model-select">Select Detection Model:</label>
      <select 
        id="model-select" 
        value={selected} 
        onChange={handleSelect}
        style={{ padding: "8px", width: "100%" }}
      >
        {modelOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
        Models are loaded directly from Hugging Face 🤗 and cached in browser
      </p>
    </div>
  );
}
