import { useState, useRef } from "react";
import { Camera, Upload, ImageIcon, Loader2, CheckCircle2, X, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../App";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL;

export const ImageClassifier = ({ onProductIdentified, onUseForClassification }) => {
  const { t, language } = useLanguage(); // Get current language
  const { token } = useAuth();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
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
    setRetryCount(0);
    
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

  // Compress image using canvas
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      const timeout = setTimeout(() => {
        reject(new Error("Timeout comprimiendo imagen"));
      }, 15000);
      
      img.onload = () => {
        clearTimeout(timeout);
        
        let { width, height } = img;
        const maxWidth = 1024;
        const maxHeight = 1024;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        URL.revokeObjectURL(img.src);
        resolve(compressedBase64);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(img.src);
        reject(new Error("Error cargando imagen"));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const analyzeImage = async () => {
    if (!image) return;
    
    // Check token
    if (!token) {
      setError("Sesión expirada. Por favor recarga la página e inicia sesión de nuevo.");
      return;
    }
    
    setAnalyzing(true);
    setError(null);
    
    try {
      // Compress image
      let base64;
      try {
        base64 = await compressImage(image);
      } catch (compressError) {
        console.warn("Compression failed, using original:", compressError);
        base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Error leyendo imagen"));
          reader.readAsDataURL(image);
        });
      }
      
      if (!base64 || !base64.includes("base64,")) {
        throw new Error("Error procesando la imagen");
      }
      
      const response = await axios({
        method: 'POST',
        url: `${API}/api/image/analyze`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: { 
          image_base64: base64,
          language: language // Send selected language
        },
        timeout: 90000,
        validateStatus: (status) => status < 500
      });
      
      if (response.status === 401) {
        throw new Error("Sesión expirada. Por favor recarga la página e inicia sesión de nuevo.");
      }
      
      if (response.status >= 400) {
        const errorMsg = response.data?.detail || response.data?.message || "Error del servidor";
        throw new Error(errorMsg);
      }
      
      if (!response.data?.product_description) {
        console.error("Invalid response:", response.data);
        throw new Error("La respuesta no contiene la descripción del producto");
      }
      
      setAnalysisResult(response.data);
      setRetryCount(0);
      
      if (onProductIdentified) {
        onProductIdentified(response.data);
      }
      
    } catch (err) {
      console.error("Image analysis error:", err);
      
      let errorMessage = "Error al analizar la imagen.";
      
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        errorMessage = "La solicitud tardó demasiado. Intenta con una imagen más pequeña.";
      } else if (err.message?.includes('Network Error')) {
        errorMessage = "Error de conexión. Verifica tu internet.";
      } else if (err.response?.status === 401 || err.message?.includes('Sesión expirada')) {
        errorMessage = "Sesión expirada. Por favor recarga la página e inicia sesión de nuevo.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRetry = () => {
    analyzeImage();
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
    setRetryCount(0);
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
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
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
                    Analizar Imagen
                  </>
                )}
              </Button>
            )}

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
                    <p className="text-cyan-400 font-mono text-sm">
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

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
        >
          <p className="text-red-400 text-sm mb-2">{error}</p>
          {retryCount < 3 && !error.includes("Sesión expirada") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={handleRetry}
              disabled={analyzing}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar ({3 - retryCount} intentos restantes)
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default ImageClassifier;
