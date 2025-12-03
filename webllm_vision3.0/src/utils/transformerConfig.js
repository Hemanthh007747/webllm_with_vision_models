import { env } from "@xenova/transformers";

// Configure Transformers.js
env.allowRemoteModels = true;
env.allowLocalModels = false;
env.remotePathTemplate = "https://huggingface.co/{model}/resolve/main/onnx";
