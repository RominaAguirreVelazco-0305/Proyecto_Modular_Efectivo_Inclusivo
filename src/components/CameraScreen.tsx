import React, { useEffect, useRef, useState } from 'react';
import { Camera, RotateCcw, LogOut, Volume2, VolumeX, Zap, AlertCircle } from 'lucide-react';
import { AccessibleButton } from './AccessibleButton';
import { audioFeedback } from '../utils/audioFeedback';

interface CameraScreenProps {
  onLogout: () => void;
  userName: string;
}

// 🔑 CREDENCIALES ROBOFLOW
const ROBOFLOW_API_KEY = "XIR9R2SZP1mmwfIYYL4Q";
const ROBOFLOW_MODEL = "proyecto_efectivo_inclusivo-zjz0l/1";
const ROBOFLOW_URL = `https://serverless.roboflow.com/${ROBOFLOW_MODEL}`;

// ⚙️ CONFIGURACIÓN DE DETECCIÓN
const DETECTION_CONFIG = {
  INTERVAL_MS: 1500, // Analizar cada 1.5 segundos
  MIN_CONFIDENCE: 0.90, // 🎯 SOLO considera detecciones con 90%+
  STABLE_FRAMES: 2, // Necesita 2 detecciones consecutivas iguales
  CONFIDENCE_THRESHOLD_VOICE: 0.90, // 🎯 90% para ANUNCIAR POR VOZ
  FRAMES_TO_FORGET: 2, // Después de 2 frames sin ver el billete, olvidar
};

export const CameraScreen: React.FC<CameraScreenProps> = ({ onLogout, userName }) => {
  const webcamContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentPrediction, setCurrentPrediction] = useState<string>('');
  const [videoKey, setVideoKey] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // 🎯 Control de detecciones estables
  const lastDetectedClassRef = useRef<string | null>(null);
  const lastAnnouncedClassRef = useRef<string | null>(null);
  const stableFrameCountRef = useRef(0);
  const framesWithoutBillRef = useRef(0);
  
  const lastSpokenMessageRef = useRef<string>('');
  const isSpeakingRef = useRef(false);
  const speakTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const speak = (text: string, force: boolean = false) => {
    if (!audioEnabled) return;
    if (!force && text === lastSpokenMessageRef.current) return;
    
    if (isSpeakingRef.current) {
      window.speechSynthesis.cancel();
      isSpeakingRef.current = false;
    }

    try {
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
      
      window.speechSynthesis.cancel();
      
      speakTimeoutRef.current = setTimeout(() => {
        isSpeakingRef.current = true;
        lastSpokenMessageRef.current = text;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 1;
        
        utterance.onstart = () => {
          console.log(`🔊 "${text}"`);
        };
        
        utterance.onend = () => {
          isSpeakingRef.current = false;
        };
        
        utterance.onerror = () => {
          isSpeakingRef.current = false;
        };
        
        window.speechSynthesis.speak(utterance);
        
      }, 100);
      
    } catch (err) {
      console.error('Error speak:', err);
      isSpeakingRef.current = false;
    }
  };

  // 🧹 LIMPIAR HISTORIAL DE DETECCIÓN
  const clearDetectionHistory = () => {
    console.log('🧹 Limpiando historial de detección');
    lastDetectedClassRef.current = null;
    lastAnnouncedClassRef.current = null;
    stableFrameCountRef.current = 0;
    framesWithoutBillRef.current = 0;
    lastSpokenMessageRef.current = '';
  };

  // 🔄 DETECCIÓN EN TIEMPO REAL CON ESTABILIZACIÓN
  const analyzeFrame = async () => {
    if (!videoRef.current || !cameraActive || isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);

    try {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      // Verificar que el video esté listo
      if (video.readyState < 2) {
        setIsAnalyzing(false);
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('No se pudo obtener contexto del canvas');
      }
      
      ctx.drawImage(video, 0, 0);
      
      // Calidad media para balance velocidad/precisión
      const base64Image = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
      
      const response = await fetch(`${ROBOFLOW_URL}?api_key=${ROBOFLOW_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: base64Image
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // 🔍 DEBUG: Ver todas las predicciones
      console.log('═══════════════════════════════════');
      console.log('📊 PREDICCIONES RAW:');
      if (data.predictions && data.predictions.length > 0) {
        data.predictions.forEach((pred: any, i: number) => {
          console.log(`  ${i + 1}. Clase: $${pred.class} MXN - Confianza: ${(pred.confidence * 100).toFixed(2)}%`);
        });
      } else {
        console.log('  ❌ Sin predicciones');
      }
      console.log('═══════════════════════════════════');
      
      // 🎯 PROCESAR DETECCIONES - SOLO SI SON 90%+
      if (data.predictions && data.predictions.length > 0) {
        // 🆕 Filtrar SOLO predicciones con 90%+ de confianza
        const highConfidencePredictions = data.predictions.filter(
          (pred: any) => pred.confidence >= DETECTION_CONFIG.MIN_CONFIDENCE
        );
        
        if (highConfidencePredictions.length > 0) {
          // Tomar la mejor predicción
          const bestPrediction = highConfidencePredictions.sort(
            (a: any, b: any) => b.confidence - a.confidence
          )[0];
          
          const detectedClass = bestPrediction.class;
          const confidence = bestPrediction.confidence;
          
          console.log(`🎯 ALTA CONFIANZA: $${detectedClass} MXN (${(confidence * 100).toFixed(1)}% ≥ 90%)`);
          
          // Resetear contador de frames sin billete
          framesWithoutBillRef.current = 0;
          
          // 🔒 ESTABILIZACIÓN: Verificar si es la misma clase
          if (detectedClass === lastDetectedClassRef.current) {
            stableFrameCountRef.current++;
            console.log(`📊 Frames estables: ${stableFrameCountRef.current}/${DETECTION_CONFIG.STABLE_FRAMES}`);
            
            // ✅ DETECCIÓN ESTABLE CONFIRMADA
            if (stableFrameCountRef.current >= DETECTION_CONFIG.STABLE_FRAMES) {
              const confidencePercent = (confidence * 100).toFixed(1);
              const displayText = `💵 $${detectedClass} MXN\n${confidencePercent}% confianza`;
              
              setCurrentPrediction(displayText);
              setError(null);
              
              // 🔊 ANUNCIAR (ya sabemos que es 90%+)
              if (lastAnnouncedClassRef.current !== detectedClass) {
                speak(`Billete de ${detectedClass} pesos mexicanos detectado`);
                lastAnnouncedClassRef.current = detectedClass;
                console.log(`🔊 ✅ ANUNCIADO: $${detectedClass} MXN (${confidencePercent}%)`);
              }
            } else {
              // Mientras se estabiliza, mostrar "Detectando..." SOLO si es 90%+
              setCurrentPrediction(`🔍 Detectando $${detectedClass}...`);
            }
          } else {
            // 🔄 Nueva clase detectada, reiniciar contador
            console.log(`🔄 Cambio: ${lastDetectedClassRef.current || 'ninguno'} → $${detectedClass} MXN`);
            lastDetectedClassRef.current = detectedClass;
            stableFrameCountRef.current = 1;
            
            // Mostrar "Detectando..." mientras se estabiliza
            setCurrentPrediction(`🔍 Detectando $${detectedClass}...`);
          }
          
        } else {
          // 🆕 Hay predicciones pero NINGUNA con 90%+
          console.log(`🔇 Predicciones descartadas (todas < 90%)`);
          handleNoBillDetection();
        }
      } else {
        // No detectó ningún billete
        handleNoBillDetection();
      }

    } catch (err) {
      console.error('❌ Error en análisis:', err);
      setError(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ⚠️ Manejar cuando NO se detecta billete con 90%+
  const handleNoBillDetection = () => {
    framesWithoutBillRef.current++;
    
    console.log(`❌ Sin billete válido (${framesWithoutBillRef.current}/${DETECTION_CONFIG.FRAMES_TO_FORGET} frames)`);
    
    // 🧹 LIMPIAR HISTORIAL si pasan varios frames sin ver billete
    if (framesWithoutBillRef.current >= DETECTION_CONFIG.FRAMES_TO_FORGET) {
      if (lastDetectedClassRef.current !== null) {
        console.log(`🗑️ Olvidando billete anterior: $${lastDetectedClassRef.current} MXN`);
        clearDetectionHistory();
      }
      
      // 🔇 SILENCIO TOTAL - Pantalla vacía, sin audio
      setCurrentPrediction('');
    } else {
      // Aún en periodo de gracia - Pantalla vacía
      setCurrentPrediction('');
    }
  };

  // ▶️ Iniciar detección en tiempo real
  const startRealtimeDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    console.log('🎬 Iniciando detección en tiempo real');
    console.log(`⚙️ Config: MIN=${DETECTION_CONFIG.MIN_CONFIDENCE*100}%, VOICE=${DETECTION_CONFIG.CONFIDENCE_THRESHOLD_VOICE*100}%`);
    clearDetectionHistory();
    
    // Esperar un momento para que el video esté listo
    setTimeout(() => {
      detectionIntervalRef.current = setInterval(() => {
        analyzeFrame();
      }, DETECTION_CONFIG.INTERVAL_MS);
      
      // Primera detección inmediata
      analyzeFrame();
    }, 1000);
  };

  // ⏹️ Detener detección en tiempo real
  const stopRealtimeDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    
    clearDetectionHistory();
  };

  useEffect(() => {
    return () => {
      stopCamera();
      stopRealtimeDetection();
      window.speechSynthesis.cancel();
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      
      if (!video.srcObject) {
        video.srcObject = streamRef.current;
        video.play().then(() => {
          console.log('✅ Video reproduciendo');
          startRealtimeDetection();
        }).catch(err => {
          console.error('Error playing video:', err);
        });
      }
    }
  }, [cameraActive, videoKey]);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🎥 Iniciando cámara...');
      
      if (!webcamContainerRef.current) {
        throw new Error('Contenedor de cámara no encontrado');
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      console.log('📱 Solicitando permisos de cámara...');
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      console.log('✅ Stream obtenido:', stream.active);

      setCurrentPrediction("");
      clearDetectionHistory();
      
      setCameraActive(true);
      setVideoKey(prev => prev + 1);
      
      setTimeout(() => {
        speak("Cámara activada");
      }, 800);
      
    } catch (err: any) {
      console.error('[ERROR CÁMARA]', err);
      setError(`Error: ${err.message || 'No se pudo acceder a la cámara'}`);
      speak("Error al iniciar cámara");
      setCameraActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const flipCamera = async () => {
    if (!cameraActive) return;
    
    try {
      speak("Cambiando cámara");
      stopCamera();
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
      
      setTimeout(() => {
        startCamera();
      }, 300);
      
    } catch (err: any) {
      setError(`Error: ${err.message}`);
    }
  };

  const stopCamera = () => {
    console.log('🛑 Deteniendo cámara...');
    
    stopRealtimeDetection();
    setCameraActive(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
      videoRef.current = null;
    }
    
    window.speechSynthesis.cancel();
    isSpeakingRef.current = false;
    
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }
    
    setCurrentPrediction('');
  };

  const toggleAudio = () => {
    setAudioEnabled(prev => {
      const newValue = !prev;
      audioFeedback.setEnabled(newValue);
      if (newValue) {
        setTimeout(() => {
          speak("Audio activado", true);
        }, 200);
      } else {
        window.speechSynthesis.cancel();
        isSpeakingRef.current = false;
      }
      return newValue;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
      </div>

      <header className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white">
            Efectivo inclusivo - {userName}
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleAudio}
            className={`backdrop-blur-sm rounded-full p-3 text-white transition-all duration-200 focus:outline-none focus:ring-2 ${
              audioEnabled 
                ? 'bg-green-500/30 hover:bg-green-500/40 focus:ring-green-400/50 border-2 border-green-400' 
                : 'bg-red-500/30 hover:bg-red-500/40 focus:ring-red-400/50 border-2 border-red-400'
            }`}
            aria-label={audioEnabled ? "Desactivar audio" : "Activar audio"}
          >
            {audioEnabled ? <Volume2 className="w-6 h-6 text-green-300 animate-pulse" /> : <VolumeX className="w-6 h-6 text-red-300" />}
          </button>

          {cameraActive && (
            <button
              onClick={flipCamera}
              className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Cambiar cámara"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          )}

          <AccessibleButton
            onClick={onLogout}
            variant="danger"
            className="!py-3 !px-4 !min-h-0"
            ariaLabel="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </AccessibleButton>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center min-h-screen p-4 pt-20">
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg flex items-center space-x-3 text-white max-w-md">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div 
          ref={webcamContainerRef}
          className="relative w-full max-w-4xl bg-black/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl"
          style={{ aspectRatio: '16/9', minHeight: cameraActive ? 'unset' : '400px' }}
        >
          {!cameraActive && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-6">
              <div className="bg-blue-600/20 backdrop-blur-sm rounded-full p-8">
                <Camera className="w-16 h-16 text-blue-400" />
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Reconocimiento de Billetes Mexicanos</h2>
                <p className="text-lg text-gray-300 max-w-md">
                  Sistema accesible con guía por voz para personas invidentes
                </p>
                <p className="text-sm text-green-300 max-w-md">
                  ⚡ Detección en tiempo real - Solo anuncia con 90%+ confianza
                </p>
              </div>
              
              <AccessibleButton
                onClick={startCamera}
                variant="primary"
                className="!text-xl"
                ariaLabel="Activar cámara"
              >
                <div className="flex items-center space-x-3">
                  <Camera className="w-6 h-6" />
                  <span>Activar Cámara</span>
                </div>
              </AccessibleButton>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
              <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xl font-semibold">Iniciando cámara...</p>
            </div>
          )}

          {cameraActive && streamRef.current && (
            <video
              key={videoKey}
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '1rem',
                backgroundColor: '#000',
                display: 'block'
              }}
            />
          )}
        </div>

        {cameraActive && currentPrediction && (
          <div className="mt-6 flex flex-col items-center space-y-3">
            <div 
              className={`backdrop-blur-sm text-white text-2xl font-bold py-6 px-10 rounded-2xl text-center min-w-[400px] shadow-xl border-4 transition-all duration-300 ${
                currentPrediction.includes('💵')
                  ? 'bg-green-500/60 border-green-300 scale-110 shadow-green-500/70' 
                  : 'bg-blue-500/50 border-blue-300'
              }`}
              role="status"
              aria-live="assertive"
              style={{ whiteSpace: 'pre-line' }}
            >
              {currentPrediction}
            </div>
          </div>
        )}

        {cameraActive && (
          <div className="mt-6 flex flex-col items-center space-y-3">
            <div className={`flex items-center space-x-3 px-6 py-3 rounded-full ${
              audioEnabled ? 'bg-green-500/30 border-2 border-green-400' : 'bg-red-500/30 border-2 border-red-400'
            }`}>
              {audioEnabled ? (
                <>
                  <Volume2 className="w-6 h-6 text-green-300 animate-pulse" />
                  <span className="text-green-200 font-bold text-lg">AUDIO ACTIVO (≥90% para anunciar)</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-6 h-6 text-red-300" />
                  <span className="text-red-200 font-bold text-lg">AUDIO DESACTIVADO</span>
                </>
              )}
            </div>
          </div>
        )}

        {cameraActive && (
          <div className="mt-4 flex items-center space-x-4 text-white/80">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Detección activa</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">⚡ Roboflow AI</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">🎯 Umbral: ≥90%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};