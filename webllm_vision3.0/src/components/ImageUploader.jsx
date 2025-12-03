import React from "react";

export default function ImageUploader({ onImageLoaded }) {
  const handleFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    onImageLoaded(url);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <label htmlFor="image-input" style={{ display: "block", marginBottom: "10px" }}>
        <strong>📸 Upload Image:</strong>
      </label>
      <input
        id="image-input"
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{
          padding: "10px",
          border: "2px solid #4CAF50",
          borderRadius: "4px",
          width: "100%",
        }}
      />
    </div>
  );
}
