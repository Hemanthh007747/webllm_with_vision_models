# WebLLM with Vision Models

A high-performance browser-based application that enables Vision Language Model (VLM) inference entirely within the web browser using WebGPU acceleration [web:12][web:13]. This project brings powerful multimodal AI capabilities—including image understanding, visual question answering, and OCR—directly to the client side without requiring server infrastructure [web:14][web:15].

## Overview

This project leverages the WebLLM framework to run state-of-the-art vision language models locally in the browser [web:25]. By utilizing WebGPU for hardware acceleration and WebAssembly for efficient computation, the application provides private, low-latency AI interactions without sending data to external servers [web:15][web:19].

### Key Capabilities

The application enables users to:
- Upload images and ask questions about their content
- Perform optical character recognition (OCR) on documents and images
- Analyze visual scenes and extract detailed descriptions
- Engage in multi-turn conversations about images [web:27]
- Process multiple images in a single conversation thread
- Generate structured responses with JSON mode support [web:13]

## Features

### Browser-Native Inference
- **Zero Server Dependency**: All model inference runs locally in your browser [web:12][web:15]
- **WebGPU Acceleration**: Leverages modern GPU APIs for high-performance computation [web:25]
- **Privacy-First Design**: No data leaves your device; all processing happens client-side [web:15]
- **Cross-Platform Compatibility**: Works on any device with WebGPU-enabled browsers (Chrome, Edge, Firefox) [web:25]

### Vision-Language Understanding
- **Image Analysis**: Upload images and ask natural language questions about content [web:29]
- **Document OCR**: Extract text from images, screenshots, and scanned documents [web:27]
- **Visual Reasoning**: Understand spatial relationships, count objects, and analyze scenes [web:23]
- **Multi-Image Support**: Process and compare multiple images in conversation [web:27]

### Developer-Friendly Architecture
- **OpenAI-Compatible API**: Familiar chat completion interface for easy integration [web:13][web:14]
- **Streaming Responses**: Real-time token generation for interactive experiences [web:15]
- **Extensive Model Support**: Compatible with LLaVA, Qwen-VL, and other popular VLMs [web:26][web:29]
- **WebAssembly Optimization**: High-performance CPU fallback for devices without GPU [web:14]

## Supported Models

The application supports multiple vision-language models optimized for browser inference [web:13][web:22]:

### Available VLMs
- **LLaVA (Large Language and Vision Assistant)**: General-purpose multimodal understanding [web:29]
- **Qwen-VL**: Advanced Chinese and English vision-language capabilities [web:26]
- **LLaVA-Interleave**: Efficient small-scale VLM for resource-constrained environments [web:29]
- **Phi-3 Vision**: Microsoft's compact multimodal model
- **MiniCPM-V**: Lightweight vision model for mobile and edge devices

Each model is quantized and optimized specifically for WebGPU execution [web:13].

## Technical Architecture

### Frontend Stack
Browser Application
├── WebGPU API (Hardware Acceleration)
├── WebAssembly (CPU Computation)
├── IndexedDB (Model Storage)
└── JavaScript/TypeScript (Application Logic)

text

### Inference Pipeline
1. **Model Loading**: Download and cache quantized models in browser storage [web:14]
2. **Image Processing**: Resize and preprocess images using Canvas API
3. **Vision Encoding**: Extract visual features through vision encoder [web:20]
4. **Text Tokenization**: Convert prompts using model-specific tokenizers [web:27]
5. **Multimodal Fusion**: Combine vision and language representations [web:17]
6. **Response Generation**: Decode tokens autoregressively with WebGPU kernels [web:21]

### Key Technologies
- **WebLLM Framework**: Core inference engine from MLC-AI [web:13][web:14]
- **WebGPU**: W3C standard for GPU acceleration in browsers [web:25]
- **Apache TVM**: Machine learning compiler for optimized kernels [web:14]
- **WASM**: High-performance CPU computation [web:19]

## Installation

### Prerequisites
- Modern browser with WebGPU support:
  - Chrome/Edge 113+ 
  - Firefox 119+
  - Safari 18+ (experimental)
- Minimum 4GB RAM (8GB recommended)
- GPU with WebGPU support (optional but recommended)

### Setup

Clone the repository
git clone https://github.com/Hemanthh007747/webllm_with_vision_models.git
cd webllm_with_vision_models

Install dependencies
npm install

Start development server
npm run dev

Build for production
npm run build

text

### Using CDN (No Build Required)

<!DOCTYPE html> <html> <head> <script type="module"> import * as webllm from "https://esm.run/@mlc-ai/web-llm";
text
    const messages = [
        {
            role: "user",
            content: [
                { type: "text", text: "What's in this image?" },
                { 
                    type: "image_url",
                    image_url: { url: "data:image/jpeg;base64,..." }
                }
            ]
        }
    ];

    const engine = await webllm.CreateMLCEngine(
        "llava-interleave-qwen-0.5b-hf",
        { initProgressCallback: (progress) => console.log(progress) }
    );

    const reply = await engine.chat.completions.create({
        messages: messages,
    });
    
    console.log(reply.choices.message.content);
</script>
</head> <body> <h1>WebLLM Vision Chat</h1> <input type="file" id="imageInput" accept="image/*"> <textarea id="promptInput" placeholder="Ask about the image..."></textarea> <button id="sendButton">Send</button> <div id="response"></div> </body> </html> ```
Usage Examples
Basic Image Question Answering
text
import { CreateMLCEngine } from "@mlc-ai/web-llm";

// Initialize engine with vision model
const engine = await CreateMLCEngine("llava-v1.5-7b-q4f32_1", {
    initProgressCallback: (progress) => {
        console.log(`Loading: ${progress.text}`);
    }
});

// Convert image to base64
const imageBase64 = await imageToBase64(imageFile);

// Ask question about image
const response = await engine.chat.completions.create({
    messages: [
        {
            role: "user",
            content: [
                { type: "text", text: "Describe this image in detail" },
                {
                    type: "image_url",
                    image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
                }
            ]
        }
    ],
    temperature: 0.7,
    max_tokens: 512
});

console.log(response.choices.message.content);
Streaming Responses
text
const stream = await engine.chat.completions.create({
    messages: [
        {
            role: "user",
            content: [
                { type: "text", text: "What objects do you see?" },
                { type: "image_url", image_url: { url: imageDataURL } }
            ]
        }
    ],
    stream: true
});

for await (const chunk of stream) {
    const content = chunk.choices?.delta?.content || "";
    process.stdout.write(content);
}
Multi-Turn Conversation
text
const conversationHistory = [];

// First turn: Upload image and ask initial question
conversationHistory.push({
    role: "user",
    content: [
        { type: "text", text: "What's the main subject of this photo?" },
        { type: "image_url", image_url: { url: imageURL } }
    ]
});

const reply1 = await engine.chat.completions.create({
    messages: conversationHistory
});

conversationHistory.push({
    role: "assistant",
    content: reply1.choices.message.content
});

// Follow-up question (image context retained)
conversationHistory.push({
    role: "user",
    content: [{ type: "text", text: "What colors are prominent?" }]
});

const reply2 = await engine.chat.completions.create({
    messages: conversationHistory
});
OCR Example
text
const ocrResponse = await engine.chat.completions.create({
    messages: [
        {
            role: "system",
            content: "You are an OCR assistant. Extract all text from images accurately."
        },
        {
            role: "user",
            content: [
                { type: "text", text: "Extract all text from this document" },
                { type: "image_url", image_url: { url: documentImage } }
            ]
        }
    ]
});
Project Structure
text
webllm_with_vision_models/
├── src/
│   ├── components/
│   │   ├── ChatInterface.tsx      # Main chat UI component
│   │   ├── ImageUploader.tsx      # Image upload handler
│   │   ├── MessageBubble.tsx      # Chat message display
│   │   └── ModelSelector.tsx      # VLM model picker
│   ├── lib/
│   │   ├── webllm-engine.ts       # WebLLM initialization
│   │   ├── image-processor.ts     # Image preprocessing
│   │   ├── model-manager.ts       # Model loading logic
│   │   └── storage-manager.ts     # IndexedDB caching
│   ├── types/
│   │   └── index.ts               # TypeScript definitions
│   ├── utils/
│   │   ├── image-utils.ts         # Image conversion helpers
│   │   └── format-utils.ts        # Response formatting
│   ├── App.tsx                    # Root component
│   └── main.tsx                   # Entry point
├── public/
│   ├── models/                    # Cached model files
│   └── assets/                    # Static resources
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
Performance Optimization
Model Caching
Models are automatically cached in IndexedDB after first download [web:14]:

Initial load: 30-60 seconds (model download)

Subsequent loads: 2-5 seconds (cache retrieval)

Inference Speed
Typical performance on modern hardware [web:21]:

With GPU (WebGPU): 15-30 tokens/second

CPU Only (WASM): 2-5 tokens/second

First token latency: 500ms-2s

Memory Management
text
// Clear model from memory
await engine.unload();

// Reset conversation context
await engine.resetChat();

// Monitor GPU memory
const stats = await engine.runtimeStatsText();
console.log(stats);
Configuration
Model Configuration
text
const config = {
    model: "llava-v1.5-7b-q4f32_1",
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 1024,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    use_cache: true,
    logit_bias: {},
};
Advanced Options
text
const engine = await CreateMLCEngine(modelName, {
    initProgressCallback: progressHandler,
    appConfig: {
        useIndexedDBCache: true,
        maxStorageSizeMB: 10000,
    },
    chatOpts: {
        conv_template: "llava_v1",
        context_window_size: 4096,
    }
});
Browser Compatibility
Browser	Version	WebGPU	Status
Chrome	113+	✅	Fully Supported
Edge	113+	✅	Fully Supported
Firefox	119+	✅	Experimental
Safari	18+	⚠️	Partial Support
Use Cases
Document Understanding
Invoice processing and data extraction [web:23]

Form analysis and field recognition

Receipt scanning and expense tracking

ID card and passport information extraction

Educational Applications
Math problem solving from photos [web:27]

Diagram and chart interpretation

Historical image analysis

Science experiment documentation

Accessibility
Image description for visually impaired users

Sign language recognition

Text-to-speech from images

Visual assistance applications

Content Creation
Image captioning and metadata generation

Social media content analysis

Product catalog enrichment

Visual content moderation

Troubleshooting
WebGPU Not Available
text
if (!navigator.gpu) {
    console.error("WebGPU not supported. Please use Chrome 113+");
    // Fallback to WASM-only mode
}
Out of Memory Errors
Use smaller quantized models (q4 instead of q8)

Reduce max_tokens parameter

Clear browser cache and restart

Close other GPU-intensive tabs

Slow Performance
Ensure hardware acceleration is enabled

Use appropriate model size for your device

Check GPU is being utilized (not CPU fallback)

Update graphics drivers

Contributing
Contributions are welcome! Please:

Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit changes (git commit -m 'Add amazing feature')

Push to branch (git push origin feature/amazing-feature)

Open a Pull Request

Roadmap
 Add support for video understanding (frame-by-frame)

 Implement RAG with image retrieval [web:18]

 Multi-language UI internationalization

 Mobile-optimized interface

 Batch image processing

 Export conversation history

 Custom model fine-tuning interface

License
[Specify your license]

Acknowledgments
MLC-AI Team: For the incredible WebLLM framework [web:13][web:14]

Apache TVM Community: ML compiler infrastructure [web:14]

HuggingFace: Model hosting and VLM implementations [web:29]

WebGPU Working Group: Browser GPU standards [web:25]

References
WebLLM Official Documentation [web:12]

WebLLM GitHub Repository [web:13]

WebLLM Research Paper [web:14]

Vision Language Models Guide [web:23]

Contact
GitHub: @Hemanthh007747

Project: webllm_with_vision_models

Note: This is a demonstration project showcasing browser-based vision-language model inference [web:15]. For production applications, consider factors like model licensing, user privacy policies, and performance optimization for your specific use case [web:14].
****************************************************************************************************************************************
****************************************************************************************************************************************

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
