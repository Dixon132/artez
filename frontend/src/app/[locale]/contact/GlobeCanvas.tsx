"use client";
import { useEffect, useRef } from "react";
import createGlobe from "cobe";

export default function GlobeCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let phi = 0;
        let animationFrameId: number;

        const globe = createGlobe(canvas, {
            devicePixelRatio: 2,
            width: 1000,
            height: 1000,
            phi: 0,
            theta: 0.15,
            dark: 1,
            diffuse: 1.2,
            scale: 1,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [1, 1, 1],
            markerColor: [1, 0.5, 0],
            glowColor: [1, 1, 1],
            markers: [{ location: [-16.2902, -68.1193], size: 0.08 }],
        });

        function frame() {
            phi += 0.005;
            globe.update({ phi });
            animationFrameId = requestAnimationFrame(frame);
        }
        frame();

        return () => {
            cancelAnimationFrame(animationFrameId);
            globe.destroy();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={1000}
            height={1000}
            style={{
                width: "100%",
                aspectRatio: "1 / 1",
                display: "block",
                maxHeight: "100%",
            }}
        />
    );
}