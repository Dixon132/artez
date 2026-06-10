
"use client";

import { useEffect, useRef } from "react";

export function useVantaWaves(color: number = 0xf59e0b, active: boolean = true) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!active || !containerRef.current) return;
        let effect: { destroy: () => void } | null = null;
        let isInitialized = false;

        const initVanta = () => {
            if (isInitialized) return;
            import("three").then((THREE) => {
                (window as any).THREE = THREE;
                import("vanta/dist/vanta.waves.min").then((mod) => {
                    if (!containerRef.current) return;
                    effect = mod.default({
                        el: containerRef.current,
                        THREE,
                        mouseControls: true,
                        touchControls: true,
                        gyroControls: false,
                        minHeight: 200,
                        minWidth: 200,
                        scale: 1,
                        scaleMobile: 1,
                        color,
                        shininess: 60,
                        waveHeight: 20,
                        waveSpeed: 1,
                        zoom: 0.8,
                    });
                    isInitialized = true;
                });
            });
        };

        const destroyVanta = () => {
            if (effect) {
                effect.destroy();
                effect = null;
                isInitialized = false;
            }
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                initVanta();
            } else {
                destroyVanta();
            }
        }, { threshold: 0.01 });

        observer.observe(containerRef.current);

        return () => { 
            observer.disconnect();
            destroyVanta(); 
        };
    }, [color, active]);

    return containerRef;
}
