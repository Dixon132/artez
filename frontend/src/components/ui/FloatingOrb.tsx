"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface FloatingOrbProps {
    color1?: string;
    color2?: string;
    size?: string;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    delay?: number;
    children?: React.ReactNode;
    enterFrom?: "left" | "right" | "bottom";
}

export default function FloatingOrb({
    color1 = "#C4612E",
    color2 = "#2D3561",
    size = "120px",
    top,
    left,
    right,
    bottom,
    delay = 0,
    children,
    enterFrom = "right"
}: FloatingOrbProps) {
    const orbRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!orbRef.current) return;

        let startX = 0;
        let startY = 0;
        
        if (enterFrom === "left") startX = -200;
        if (enterFrom === "right") startX = 200;
        if (enterFrom === "bottom") startY = 200;

        // Anima la bolita entrando y rebotando con el scroll (parallax / scrub)
        gsap.fromTo(
            orbRef.current,
            { 
                x: startX,
                y: startY, 
                opacity: 0, 
                rotationX: -45,
                rotationY: -45,
                scale: 0.5 
            },
            {
                x: 0,
                y: 0,
                opacity: 1,
                rotationX: 0,
                rotationY: 0,
                scale: 1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: orbRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1, // Hace que siga el scroll y "rebote" suavemente
                }
            }
        );

        // Anima la bolita rotando sutilmente en 3D en bucle
        gsap.to(orbRef.current, {
            rotationY: "+=360",
            rotationX: "+=180",
            duration: 20,
            repeat: -1,
            ease: "none"
        });
    }, [delay]);

    return (
        <div
            ref={orbRef}
            style={{
                position: "absolute",
                top,
                left,
                right,
                bottom,
                width: size,
                height: size,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${color1}, ${color2})`,
                boxShadow: "0 20px 40px rgba(0,0,0,0.3), inset 0 10px 20px rgba(255,255,255,0.2), inset 0 -10px 20px rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                transformStyle: "preserve-3d",
                zIndex: 5,
                pointerEvents: "none" // Para no interferir con los clics
            }}
        >
            {/* 
               El contenido "children" escalará solito.
               Aquí puedes poner una imagen, un texto, o un modelo 3D.
            */}
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
                {children}
            </div>
        </div>
    );
}
