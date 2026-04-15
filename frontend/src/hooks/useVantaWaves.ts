"use client";

import { useEffect, useRef } from "react";

export function useVantaWaves(color: number = 0xf59e0b) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        let effect: { destroy: () => void } | null = null;

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
            });
        });

        return () => { effect?.destroy(); };
    }, [color]);

    return containerRef;
}
