"use client";

import { useEffect, useRef, useState } from "react";

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
    const [inView, setInView] = useState(false);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setInView(true);
                        setShouldLoad(true);
                        // Safe play attempt
                        setTimeout(() => {
                            if (videoRef.current) {
                                videoRef.current.play().catch(() => {});
                            }
                        }, 50);
                    } else {
                        setInView(false);
                        if (videoRef.current) {
                            videoRef.current.pause();
                        }
                    }
                });
            },
            { rootMargin: "200px 0px" }
        );

        observer.observe(video);
        return () => observer.disconnect();
    }, []);

    // We use the MP4 source if available, fallback to WebM, to guarantee it works. 
    // Setting src directly on the video tag avoids all React <source> update issues.
    const videoSrc = shouldLoad ? (srcMp4 || srcWebm) : undefined;

    return (
        <div className={`overflow-hidden ${className}`} style={style}>
            <video
                ref={videoRef}
                src={videoSrc}
                muted
                loop
                playsInline
                preload="metadata"
                poster={poster}
                className="w-full h-full object-cover"
                style={{ 
                    opacity: shouldLoad ? 1 : 0.7, 
                    transition: "opacity 0.5s ease"
                }}
            />
            
            {/* Color Overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundColor: overlayColor }}
            />
        </div>
    );
}
