import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Camera, AlertCircle } from 'lucide-react';
import { loadRequiredModels } from '../services/faceDetectionService';

interface AgeDetectorProps {
  onClose: () => void;
}

export const AgeDetector: React.FC<AgeDetectorProps> = ({ onClose }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [ages, setAges] = useState<number[]>([]);
  const [finalAge, setFinalAge] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    const initializeModels = async () => {
      const success = await loadRequiredModels();
      if (!success) {
        setLoadError(true);
      }
      setIsLoading(false);
    };

    initializeModels();
  }, []);

  useEffect(() => {
    if (loadError || isLoading) return;

    let interval: NodeJS.Timeout;
    let detectionInterval: NodeJS.Timeout;

    detectionInterval = setInterval(async () => {
      if (webcamRef.current?.video) {
        try {
          const detection = await faceapi
            .detectSingleFace(
              webcamRef.current.video,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withAgeAndGender();

          if (detection) {
            setAges(prev => [...prev, Math.round(detection.age)]);
          }
        } catch (error) {
          console.error('Detection error:', error);
        }
      }
    }, 1000);

    interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          clearInterval(detectionInterval);
          if (ages.length > 0) {
            const avgAge = Math.round(
              ages.reduce((acc, age) => acc + age, 0) / ages.length
            );
            setFinalAge(avgAge);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(detectionInterval);
    };
  }, [isLoading, loadError, ages]);

  if (loadError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Error al cargar los modelos
          </h3>
          <p className="text-gray-600 mb-4">
            No se pudieron cargar los modelos de detección facial. Por favor, intenta de nuevo más tarde.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando modelos de detección...</p>
          </div>
        ) : finalAge ? (
          <div className="text-center py-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              ¡Resultado!
            </h3>
            <p className="text-2xl text-purple-600 font-semibold">
              Tienes aproximadamente {finalAge} años
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="relative">
              <Webcam
                ref={webcamRef}
                className="rounded-lg w-full"
                mirrored
                screenshotFormat="image/jpeg"
              />
              <div className="absolute top-4 right-4 bg-white rounded-full px-4 py-2 shadow-md">
                <span className="text-lg font-semibold text-purple-600">
                  {timeLeft}s
                </span>
              </div>
            </div>
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Mantén tu rostro frente a la cámara...
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};