import { useState, useCallback } from "react";

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export interface UseGeolocationReturn {
  position: GeoPosition | null;
  isLoading: boolean;
  error: string | null;
  capture: () => Promise<GeoPosition | null>;
  clear: () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capture = useCallback(async (): Promise<GeoPosition | null> => {
    if (!navigator.geolocation) {
      setError("Geolocalização não suportada neste dispositivo.");
      return null;
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const result: GeoPosition = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setPosition(result);
          setIsLoading(false);
          resolve(result);
        },
        (err) => {
          let message = "Não foi possível obter a localização.";
          if (err.code === err.PERMISSION_DENIED)
            message = "Permissão de localização negada. Verifique as configurações do navegador.";
          else if (err.code === err.POSITION_UNAVAILABLE)
            message = "Localização indisponível. Tente em ambiente aberto.";
          else if (err.code === err.TIMEOUT)
            message = "Tempo esgotado ao obter localização. Tente novamente.";
          setError(message);
          setIsLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  const clear = useCallback(() => {
    setPosition(null);
    setError(null);
  }, []);

  return { position, isLoading, error, capture, clear };
}
