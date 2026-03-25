import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const MUSIC_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663459263490/7jSTACnGYyADJrX65GKurG/bossa-nova-bg_93cdb5ff.mp3";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [visible, setVisible] = useState(true);

  // Crear el elemento de audio una sola vez
  useEffect(() => {
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.18;
    audioRef.current = audio;

    // Intentar autoplay (funciona en algunos navegadores/contextos)
    audio.play().then(() => {
      setPlaying(true);
    }).catch(() => {
      // El navegador bloqueó el autoplay — esperar primer toque del usuario
    });

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Activar música en el primer toque/clic del usuario
  useEffect(() => {
    if (userInteracted) return;

    const handleFirstInteraction = () => {
      if (!userInteracted && audioRef.current && !playing) {
        audioRef.current.play().then(() => {
          setPlaying(true);
        }).catch(() => {});
        setUserInteracted(true);
      }
    };

    document.addEventListener("click", handleFirstInteraction, { once: true });
    document.addEventListener("touchstart", handleFirstInteraction, { once: true });
    document.addEventListener("scroll", handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
      document.removeEventListener("scroll", handleFirstInteraction);
    };
  }, [userInteracted, playing]);

  const toggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
    setUserInteracted(true);
  };

  if (!visible) return null;

  return (
    <button
      onClick={toggleMusic}
      title={playing ? "Pausar música" : "Reproducir música"}
      className="fixed bottom-20 right-4 z-40 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        background: "rgba(197, 165, 90, 0.92)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(197, 165, 90, 0.4)",
      }}
    >
      {playing ? (
        <Volume2 className="w-4 h-4 text-white" />
      ) : (
        <VolumeX className="w-4 h-4 text-white opacity-70" />
      )}
      {/* Animación de ondas cuando está reproduciendo */}
      {playing && (
        <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-[#C5A55A]" />
      )}
    </button>
  );
}
