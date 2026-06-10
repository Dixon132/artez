
"use client";

import { useEffect, useRef } from "react";

export function useVantaBirds(
    backgroundColor: number = 0x000000, 
    color1: number = 0xc4612e, 
    color2: number = 0xea580c, 
    active: boolean = true
) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!active || !containerRef.current) return;
        let effect: { destroy: () => void } | null = null;
        let isInitialized = false;

        const initVanta = () => {
            if (isInitialized) return;
            import("three").then((THREE) => {
                (window as any).THREE = THREE;
                import("vanta/dist/vanta.birds.min").then((mod) => {
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
                        backgroundColor,
                        color1,
                        color2,
                        birdSize: 1.5,
                        wingSpan: 30,
                        speedLimit: 5,
                        separation: 50,
                        alignment: 50,
                        cohesion: 50,
                        quantity: 4
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
    }, [backgroundColor, color1, color2, active]);

    return containerRef;
}
