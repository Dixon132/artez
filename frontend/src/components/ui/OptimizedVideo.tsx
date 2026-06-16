"use client";

import { useEffect, useRef } from "react";

interface OptimizedVideoProps {
    srcWebm?: string;
    srcMp4?: string;
    poster?: string;
    className?: string;
    style?: React.CSSProperties;
    overlayColor?: string;
}

export default function OptimizedVideo({
    srcWebm,
    srcMp4,
    poster,
    className = "",
    style = {},
    overlayColor = "transparent",
}: OptimizedVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoSrc = srcMp4 || srcWebm;

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const play = () => video.play().catch(() => {});
        const pause = () => video.pause();

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        play();
                    } else {
                        pause();
                    }
                });
            },
            { threshold: 0.1 }
        );

        observer.observe(video);

        // KEY FIX: if element is already visible on mount (back-navigation),
        // IntersectionObserver won't fire — so we check manually.
        const rect = video.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            play();
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div className={`overflow-hidden ${className}`} style={style}>
            <video
                ref={videoRef}
                src={videoSrc}
                muted
                loop
                playsInline
                autoPlay
                preload="auto"
                className="w-full h-full object-cover"
            />

            {/* Color Overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundColor: overlayColor }}
            />
        </div>
    );
}
