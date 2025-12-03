import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

// ============= MAIN APP =============
export default function App() {
  const [currentPage, setCurrentPage] = useState("webcam"); // "webcam" or "detection"
  const [capturedImage, setCapturedImage] = useState(null);

  const handleCapture = (imageUrl) => {
    setCapturedImage(imageUrl);
    setCurrentPage("detection");
  };

  const handleBackToWebcam = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    setCapturedImage(null);
    setCurrentPage("webcam");
  };

  return (
    <>
      {currentPage === "webcam" && <WebcamPage onCapture={handleCapture} />}
      {currentPage === "detection" && (
        <DetectionPage 
          capturedImage={capturedImage} 
          onBack={handleBackToWebcam}
        />
      )}
    </>
  );
}

// ============= WEBCAM PAGE =============
function WebcamPage({ onCapture }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    startWebcam();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: "user" } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Failed to access webcam: " + err.message);
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return;

    setIsCapturing(true);
    
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    // Stop the webcam stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      onCapture(url);
    }, "image/jpeg", 0.95);
  };

  return (
    <div style={{
      padding: "30px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#1a1a1a",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <h1 style={{ 
        fontSize: "48px", 
        marginBottom: "20px",
        color: "#fff",
        textAlign: "center"
      }}>
        📹 Live Webcam Stream
      </h1>
      <p style={{ 
        fontSize: "18px", 
        color: "#aaa", 
        marginBottom: "40px",
        textAlign: "center"
      }}>
        Position your camera and capture a frame for object detection
      </p>

      {error && (
        <div style={{
          backgroundColor: "#ff4444",
          color: "#fff",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "30px",
          maxWidth: "600px",
          textAlign: "center"
        }}>
          {error}
        </div>
      )}

      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: "900px",
        backgroundColor: "#000",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        marginBottom: "30px"
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: "auto",
            display: "block"
          }}
        />
        
        {/* Overlay guide */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          height: "80%",
          border: "3px dashed rgba(255,255,255,0.5)",
          borderRadius: "12px",
          pointerEvents: "none"
        }} />
      </div>

      <button
        onClick={captureFrame}
        disabled={!stream || isCapturing}
        style={{
          padding: "20px 60px",
          fontSize: "24px",
          fontWeight: "bold",
          backgroundColor: !stream || isCapturing ? "#555" : "#4CAF50",
          color: "#fff",
          border: "none",
          borderRadius: "50px",
          cursor: !stream || isCapturing ? "not-allowed" : "pointer",
          boxShadow: "0 4px 20px rgba(76, 175, 80, 0.4)",
          transition: "all 0.3s ease",
          transform: "scale(1)"
        }}
        onMouseEnter={(e) => {
          if (stream && !isCapturing) {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = "0 6px 30px rgba(76, 175, 80, 0.6)";
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 4px 20px rgba(76, 175, 80, 0.4)";
        }}
      >
        📸 {isCapturing ? "Capturing..." : "Capture Frame"}
      </button>

      <p style={{
        marginTop: "30px",
        fontSize: "14px",
        color: "#777",
        textAlign: "center"
      }}>
        After capturing, you'll be able to select a model and run object detection
      </p>
    </div>
  );
}

// ============= DETECTION PAGE =============
function DetectionPage({ capturedImage, onBack }) {
  const [imageUrl, setImageUrl] = useState(capturedImage);
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [selectedModel, setSelectedModel] = useState("detr-resnet");
  const [textPrompt, setTextPrompt] = useState(
    "a person, a cell phone, a book, a bottle, a bag, a laptop, a watch, headphones, glasses"
  );
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const detectorRef = useRef(null);

  const MODELS = useMemo(
    () => ({
      "yolos-tiny": {
        name: "🎲 YOLOS Tiny",
        task: "object-detection",
        modelPath: "Xenova/yolos-tiny",
        speed: "⭐⭐⭐⭐⭐",
        accuracy: "⭐⭐⭐⭐",
        description: "Real-time video",
      },
      "detr-resnet": {
        name: "🔍 DETR ResNet-50",
        task: "object-detection",
        modelPath: "Xenova/detr-resnet-50",
        speed: "⭐⭐⭐⭐⭐",
        accuracy: "⭐⭐⭐⭐",
        description: "Fast & Accurate",
      },
      "detr-mobilenet": {
        name: "⚡ DETR MobileNet",
        task: "object-detection",
        modelPath: "Xenova/detr-resnet-50-panoptic",
        speed: "⭐⭐⭐⭐⭐",
        accuracy: "⭐⭐⭐⭐",
        description: "Lightweight",
      },
      "owlvit-base": {
        name: "🚀 OWL-ViT Base",
        task: "zero-shot-object-detection",
        modelPath: "Xenova/owlvit-base-patch32",
        speed: "⭐⭐⭐⭐",
        accuracy: "⭐⭐⭐⭐⭐",
        description: "Custom prompts",
      },
      "fasterrcnn-resnet": {
        name: "🎬 Faster R-CNN ResNet",
        task: "object-detection",
        modelPath: "Xenova/detr-resnet-101",
        speed: "⭐⭐⭐⭐",
        accuracy: "⭐⭐⭐⭐⭐",
        description: "Advanced detection",
      }
    }),
    []
  );

  const currentModel = MODELS[selectedModel] || MODELS["detr-resnet"];

  const loadModel = useCallback(async () => {
    try {
      setModelLoaded(false);
      const modelConfig = MODELS[selectedModel];
      if (!modelConfig) throw new Error("Model not found");

      const { pipeline, env } = await import("@xenova/transformers");
      env.allowRemoteModels = true;
      env.allowLocalModels = false;
      env.cacheDir = ".cache";

      const detector = await pipeline(
        modelConfig.task,
        modelConfig.modelPath
      );

      detectorRef.current = detector;
      setModelLoaded(true);
    } catch (error) {
      alert(`Failed to load: ${error.message}`);
      setModelLoaded(false);
    }
  }, [selectedModel, MODELS]);

  useEffect(() => {
    loadModel();
  }, [selectedModel, loadModel]);

  const drawBoxesWithConfidence = (imageElement, detections) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = imageElement;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(img, 0, 0);

    const colorMap = {
      person: "#00ff88",
      "cell phone": "#ff0077",
      book: "#ffaa00",
      handbag: "#00aaff",
      backpack: "#00aaff",
      bag: "#00aaff",
      bottle: "#aaff00",
      laptop: "#ff44ff",
      watch: "#ffcc00",
      headphones: "#cc00ff",
      glasses: "#ff6699",
      car: "#ff00ff",
      dog: "#00ffff",
    };

    detections.forEach((det) => {
      const label = det.label.toLowerCase();
      const classColor = colorMap[label] || "#2196F3";
      const confidence = (det.score * 100).toFixed(1);

      const x = det.box.xmin;
      const y = det.box.ymin;
      const width = det.box.xmax - det.box.xmin;
      const height = det.box.ymax - det.box.ymin;

      ctx.strokeStyle = classColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      const text = `${det.label} (${confidence}%)`;
      ctx.font = "bold 16px Arial";
      const textWidth = ctx.measureText(text).width;
      const textHeight = 18;

      ctx.fillStyle = classColor;
      ctx.fillRect(x, y - textHeight > 0 ? y - textHeight : y, textWidth + 10, textHeight);

      ctx.fillStyle = "#fff";
      ctx.fillText(text, x + 5, y - 4 > 0 ? y - 4 : y + textHeight - 4);
    });
  };

  const getObjectCounts = (detections) => {
    const counts = {};
    detections.forEach((det) => {
      const label = det.label.toLowerCase();
      counts[label] = (counts[label] || 0) + 1;
    });
    return counts;
  };

  const handleRun = async () => {
    if (!imageUrl) {
      alert("No image available");
      return;
    }
    if (!modelLoaded || !detectorRef.current) {
      alert("Model loading...");
      return;
    }

    setIsRunning(true);
    setProgress(0);

    try {
      setProgress(30);
      const labels = textPrompt.split(",").map((l) => l.trim()).filter((l) => l);
      setProgress(50);

      const predictions = await detectorRef.current(imageUrl, labels, {
        threshold: 0.1,
        topk: 50,
      });

      setProgress(80);
      const detections = predictions.filter((p) => p.score > 0.1);
      setResults(detections);
      setProgress(95);

      drawBoxesWithConfidence(imgRef.current, detections);
      setProgress(100);
    } catch (e) {
      alert("Detection failed: " + e.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleFileUpload = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setImageUrl(url);
    setResults([]);
  };

  const objectCounts = getObjectCounts(results);
  const totalObjects = results.length;

  return (
    <div style={{
      padding: "30px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f0f0f0",
      minHeight: "100vh"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "30px"
      }}>
        <h1 style={{ fontSize: "32px", margin: 0 }}>🎯 Object Detection Dashboard</h1>
        <button
          onClick={onBack}
          style={{
            padding: "12px 24px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px"
          }}
        >
          ← Back to Webcam
        </button>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "350px 1fr 400px",
        gap: "30px",
        maxWidth: "2000px",
        margin: "0 auto"
      }}>
        <div style={{
          backgroundColor: "#fff",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          height: "fit-content"
        }}>
          <h2 style={{ fontSize: "20px", marginTop: 0, marginBottom: "20px" }}>🤖 Model</h2>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isRunning}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "15px",
              border: "2px solid #2196F3",
              borderRadius: "8px",
              marginBottom: "20px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            <option value="yolos-tiny">🎲 YOLOS Tiny</option>
            <option value="detr-resnet">🔍 DETR ResNet-50</option>
            <option value="detr-mobilenet">⚡ DETR MobileNet</option>
            <option value="owlvit-base">🚀 OWL-ViT Base</option>
            <option value="fasterrcnn-resnet">🎬 Faster R-CNN ResNet</option>
          </select>
          <div style={{
            padding: "15px",
            backgroundColor: "#e3f2fd",
            borderRadius: "8px",
            fontSize: "14px",
            marginBottom: "20px",
            lineHeight: "1.8"
          }}>
            <strong style={{ fontSize: "16px" }}>{currentModel.name}</strong>
            <br />
            {modelLoaded ? "✅ Ready" : "⏳ Loading..."}
            <br />
            Speed: {currentModel.speed}
            <br />
            Accuracy: {currentModel.accuracy}
          </div>
          <label style={{ fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "10px" }}>
            🔎 Classes:
          </label>
          <textarea
            value={textPrompt}
            onChange={(e) => setTextPrompt(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "13px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              minHeight: "100px",
              marginBottom: "15px",
              fontFamily: "Arial",
              resize: "none"
            }}
          />
          <button
            onClick={handleRun}
            disabled={isRunning || !imageUrl || !modelLoaded}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: isRunning || !modelLoaded ? "#ccc" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
              marginBottom: "10px"
            }}
          >
            {isRunning ? `${progress}%` : "🔍 Detect"}
          </button>
          
          <div style={{
            marginTop: "20px",
            paddingTop: "20px",
            borderTop: "2px solid #eee"
          }}>
            {/* <label style={{ fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "10px" }}>
              📸 Or Upload New Image:
            </label> */}
            {/* <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{
                width: "100%",
                padding: "10px",
                border: "2px solid #4CAF50",.
                .
                borderRadius: "4px"
              }}
            /> */}
          </div>
        </div>

        <div>
          {imageUrl && (
            <div style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}>
              <h3 style={{ marginTop: 0, marginBottom: "15px" }}>📷 Captured Image</h3>
              <div style={{
                position: "relative",
                display: "inline-block",
                width: "100%",
                marginBottom: "20px"
              }}>
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="captured"
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    borderRadius: "8px"
                  }}
                />
              </div>
              <h3 style={{ marginTop: "20px", marginBottom: "15px" }}>🎯 Detection Result</h3>
              <canvas
                ref={canvasRef}
                style={{
                  width: "100%",
                  height: "auto",
                  border: "4px solid #4CAF50",
                  borderRadius: "8px"
                }}
              />
            </div>
          )}
        </div>

        <div style={{
          backgroundColor: "#fff",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          height: "fit-content",
          maxHeight: "90vh",
          overflowY: "auto"
        }}>
          <h2 style={{ fontSize: "20px", marginTop: 0, marginBottom: "20px" }}>📊 Detected</h2>
          <div style={{
            backgroundColor: "#c8e6c9",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
            marginBottom: "20px"
          }}>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: "#2e7d32" }}>
              {totalObjects}
            </div>
            <div style={{ fontSize: "16px", color: "#555", marginTop: "10px" }}>
              Total Objects
            </div>
          </div>
          {totalObjects > 0 && (
            <div>
              <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px" }}>
                📋 Breakdown:
              </div>
              <div style={{
                display: "grid",
                gap: "12px",
                maxHeight: "400px",
                overflowY: "auto"
              }}>
                {Object.entries(objectCounts).map(([label, count]) => {
                  const classDetections = results.filter(d => d.label.toLowerCase() === label);
                  const avgConfidence = classDetections.length > 0
                    ? (classDetections.reduce((sum, d) => sum + d.score, 0) / classDetections.length * 100).toFixed(1)
                    : 0;
                  return (
                    <div
                      key={label}
                      style={{
                        padding: "14px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "8px",
                        borderLeft: "5px solid #2196F3",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "15px"
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span><strong>{label}</strong></span>
                        <span style={{ fontSize: "12px", color: "#666" }}>
                          📊 {avgConfidence}%
                        </span>
                      </div>
                      <span style={{
                        backgroundColor: "#2196F3",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontWeight: "bold",
                        minWidth: "50px",
                        textAlign: "center",
                        fontSize: "16px"
                      }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {totalObjects === 0 && (
            <div style={{
              padding: "30px",
              textAlign: "center",
              color: "#999",
              fontSize: "16px"
            }}>
              🔍 No objects detected<br />
              Select a model and press Detect
            </div>
          )}
          {totalObjects > 0 && (
            <div style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#e3f2fd",
              borderRadius: "8px",
              fontSize: "14px",
              lineHeight: "1.8"
            }}>
              <strong>📈 Stats:</strong>
              <br />
              Unique: {Object.keys(objectCounts).length}
              <br />
              Total: {totalObjects}
              <br />
              Model: {currentModel.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}