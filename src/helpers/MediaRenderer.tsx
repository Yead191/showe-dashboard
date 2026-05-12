
function MediaRenderer({ src, className }: { src: string; className?: string }) {
    if (!src) return null;
    const isVideo = src.startsWith('data:video') || src.match(/\.(mp4|webm|mov)$/i);

    if (isVideo) {
        return (
            <video
                src={src}
                autoPlay
                loop
                muted
                playsInline
                className={className}
            />
        );
    }

    return <img src={src} alt="" className={className} />;
}

export default MediaRenderer;
