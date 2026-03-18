import { useState, useRef } from "react";
import { Camera, Upload, ImageIcon, Loader2, CheckCircle2, X, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "../contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

export const ImageClassifier = ({ onProductIdentified, onUseForClassification }) => {
  const { t } = useLanguage();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Formato no soportado. Usa JPG, PNG o WebP.");
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen es demasiado grande. Máximo 10MB.");
      return;
    }
    
    setError(null);
    setImage(file);
    setAnalysisResult(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Compress image before sending to reduce size and improve performance
  const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        // Scale down if larger than maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get compressed base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        console.log(`Image compressed: original ${file.size} bytes, compressed base64 length: ${compressedBase64.length}`);
        resolve(compressedBase64);
      };
      
      img.onerror = () => reject(new Error("Error al procesar la imagen"));
      
      // Create object URL from file
      img.src = URL.createObjectURL(file);
    });
  };

  const analyzeImage = async () => {
    if (!image) return;
    
    setAnalyzing(true);
    setError(null);
    
    try {
      // Compress image to reduce size and ensure consistent format
      let base64;
      try {
        base64 = await compressImage(image);
      } catch (compressError) {
        console.error("Compression failed, falling back to original:", compressError);
        // Fallback to original file
        base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Error al leer la imagen"));
          reader.readAsDataURL(image);
        });
      }
      
      // Validate base64 result
      if (!base64 || !base64.includes("base64,")) {
        throw new Error("Error al procesar la imagen");
      }
      
      console.log("Sending image to API, base64 length:", base64.length);
      
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/image/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ image_base64: base64 })
      });
      
      // Read the response text first to avoid "body stream already read" error
      const responseText = await response.text();
      console.log("Response received, length:", responseText.length, "status:", response.status);
      
      // Parse the text as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("JSON parse error:", jsonError, "Response text:", responseText.substring(0, 500));
        throw new Error("Error al procesar la respuesta del servidor. Intenta de nuevo.");
      }
      
      if (!response.ok) {
        console.error("API error response:", data);
        throw new Error(data.detail || data.message || "Error al analizar la imagen");
      }
      
      // Validate response has expected data
      if (!data.product_description) {
        console.error("Invalid response data:", data);
        throw new Error("La respuesta no contiene descripción del producto");
      }
      
      console.log("Image analysis successful:", data.product_description.substring(0, 100));
      setAnalysisResult(data);
      
      if (onProductIdentified) {
        onProductIdentified(data);
      }
    } catch (err) {
      console.error("Image analysis error:", err);
      // More specific error messages
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        setError("Error de conexión. Verifica tu internet e intenta de nuevo.");
      } else if (err.message.includes("body stream")) {
        setError("Error de comunicación con el servidor. Por favor intenta de nuevo.");
      } else {
        setError(err.message || "Error al procesar la imagen. Por favor intenta con otra imagen.");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUseForClassification = () => {
    if (analysisResult && onUseForClassification) {
      onUseForClassification(analysisResult.product_description);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <div className="cyber-card p-6" data-testid="image-classifier">
      <h3 className="label-cyber mb-4 flex items-center gap-2">
        <Camera className="w-4 h-4" />
        {t("imageClassifier.title")}
      </h3>
      <p className="text-gray-500 text-sm mb-6">
        {t("imageClassifier.description")}
      </p>

      {/* Upload Area */}
      <AnimatePresence mode="wait">
        {!imagePreview ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
              ${isDragging 
                ? "border-cyan-400 bg-cyan-500/10" 
                : "border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/5"
              }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            data-testid="image-drop-zone"
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <p className="text-gray-300 mb-1">{t("imageClassifier.dragDrop")}</p>
                <p className="text-gray-500 text-sm">{t("imageClassifier.supportedFormats")}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  className="btn-cyber h-10 px-4 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {t("imageClassifier.uploadBtn")}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {/* Image Preview */}
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-64 object-contain rounded-lg bg-[#0a0f1a]"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-[#0d1424]/80 hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                onClick={clearImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Analyze Button */}
            {!analysisResult && (
              <Button
                type="button"
                className="btn-cyber w-full h-12"
                onClick={analyzeImage}
                disabled={analyzing}
                data-testid="analyze-image-btn"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t("imageClassifier.analyzing")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    {t("imageClassifier.analyzing").replace("...", "")}
                  </>
                )}
              </Button>
            )}

            {/* Analysis Result */}
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0a0f1a] rounded-lg p-4 border border-green-500/30"
              >
                <div className="flex items-center gap-2 mb-3 text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">{t("imageClassifier.identifiedProduct")}</span>
                </div>
                
                <p className="text-white text-lg mb-4">
                  {analysisResult.product_description}
                </p>

                {analysisResult.components && analysisResult.components.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      {t("imageClassifier.components")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.components.map((comp, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult.suggested_category && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                      Categoría sugerida
                    </p>
                    <p className="text-cyan-400 font-mono">
                      {analysisResult.suggested_category}
                    </p>
                  </div>
                )}

                <Button
                  type="button"
                  className="btn-cyber w-full h-10"
                  onClick={handleUseForClassification}
                  data-testid="use-for-classification-btn"
                >
                  {t("imageClassifier.useForClassification")}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default ImageClassifier;
