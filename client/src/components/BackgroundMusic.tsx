import { useEffect, useRef, useState } from "react";

const MUSIC_URL = "https://res.cloudinary.com/dikinwkjq/video/upload/v1774456133/nutriser-audio/bossa-nova-bg.mp3";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  // Inicializar audio
  useEffect(() => {
    const audio = document.createElement("audio");
    audio.src = MUSIC_URL;
    audio.loop = true;
    audio.volume = 0.2;
    audio.preload = "auto";
    audio.addEventListener("canplaythrough", () => setReady(true));
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const handleClick = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      // En iOS, el play() debe llamarse directamente desde un evento de usuario
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setPlaying(true))
          .catch((err) => {
            console.warn("Audio play blocked:", err);
          });
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label={playing ? "Pausar música" : "Reproducir música de fondo"}
      title={playing ? "Pausar música de fondo" : "Reproducir música de fondo"}
      style={{
        position: "fixed",
        // Posición: esquina inferior izquierda para no estorbar con contenido
        bottom: "max(env(safe-area-inset-bottom, 0px) + 80px, 90px)",
        left: "16px",
        zIndex: 9999,
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: "rgba(197, 165, 90, 0.95)",
        border: "2px solid rgba(255,255,255,0.3)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        outline: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {playing ? (
        // Ícono de volumen activo (ondas)
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      ) : (
        // Ícono de volumen silenciado
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
    </button>
  );
}
