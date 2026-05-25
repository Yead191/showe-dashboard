import { Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";

function MediaRenderer({ src, className }: { src: string; className?: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);

    if (!src) return null;
    const isVideo = src.startsWith('data:video') || src.match(/\.(mp4|webm|mov)$/i);

    if (isVideo) {
        return (
            <div className="relative w-full h-full overflow-hidden">

                <video
                    ref={videoRef}
                    src={src}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className={className}
                />
                {/* Inner Glow/Overlay */}
                <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] ring-1 ring-white/10" />

                {/* Mute/Unmute Toggle */}
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-4 right-4 p-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white/90 hover:text-white z-20 transition-all border border-white/10 shadow-lg group"
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                    {isMuted ? <VolumeX size={10} className="group-hover:scale-110 transition-transform" /> : <Volume2 size={10} className="group-hover:scale-110 transition-transform" />}
                </button>

            </div >
        );
    }

    return <img src={src} alt="" className={className} />;
}

export default MediaRenderer;
