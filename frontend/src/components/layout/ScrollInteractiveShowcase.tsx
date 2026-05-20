"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

interface ScrollInteractiveShowcaseProps {
    imageSrc: string;
    imageAlt: string;
    title: string;
    description: string;
    badgeText: string;
    side?: "left" | "right";
    theme?: "dark" | "cream";
}

export default function ScrollInteractiveShowcase({
    imageSrc,
    imageAlt,
    title,
    description,
    badgeText,
    side = "left",
    theme = "dark",
}: ScrollInteractiveShowcaseProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const outerRef = useRef<HTMLDivElement>(null);
    const innerFloatRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        const outer = outerRef.current;
        const innerFloat = innerFloatRef.current;
        const text = textRef.current;

        if (!section || !outer || !innerFloat || !text) return;

        // 1. Animación de levitación/balanceo continuo (independiente del scroll)
        const floatAnimation = gsap.to(innerFloat, {
            y: "-15px",
            rotation: 2.5,
            duration: 2.8,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
        });

        // 2. Línea de tiempo de GSAP ScrollTrigger para entrada y salida
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top 80%",   // Empieza cuando el top entra al 80% de la pantalla
                    end: "bottom 20%",  // Termina cuando el bottom sale por el 20%
                    scrub: 1.2,         // Suavizado del scroll
                },
            });

            // Animación de entrada de la imagen y los textos
            tl.fromTo(
                outer,
                {
                    x: side === "left" ? "-120%" : "120%",
                    rotation: side === "left" ? -45 : 45,
                    scale: 0.7,
                    opacity: 0,
                },
                {
                    x: "0%",
                    rotation: 0,
                    scale: 1,
                    opacity: 1,
                    duration: 1.5,
                    ease: "power2.out",
                }
            );

            // Animar elementos de texto secuencialmente
            const textChildren = text.children;
            tl.fromTo(
                textChildren,
                {
                    y: 40,
                    opacity: 0,
                },
                {
                    y: 0,
                    opacity: 1,
                    stagger: 0.15,
                    duration: 1,
                    ease: "power3.out",
                },
                "-=1" // Solapa ligeramente con la entrada de la imagen
            );

            // Animación de salida conforme te vas desplazando más hacia abajo
            tl.to(outer, {
                x: side === "left" ? "120%" : "-120%",
                rotation: side === "left" ? 90 : -90,
                scale: 0.6,
                opacity: 0,
                duration: 1.5,
                ease: "power2.in",
            }, "+=0.5"); // pequeño delay para sostenerlo en el centro

            tl.to(textChildren, {
                y: -40,
                opacity: 0,
                stagger: 0.1,
                duration: 1,
                ease: "power2.in",
            }, "<"); // corre en paralelo con la salida de la imagen
        }, section);

        return () => {
            floatAnimation.kill();
            ctx.revert();
        };
    }, [side]);

    // Clases basadas en el tema
    const isDark = theme === "dark";
    const bgClasses = isDark
        ? "bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/30 text-stone-100 border-y border-stone-800/50"
        : "bg-gradient-to-br from-stone-50 via-amber-50/15 to-stone-100/60 text-stone-900 border-y border-amber-100/30";

    const badgeClasses = isDark
        ? "bg-amber-950/60 text-amber-300 border-amber-500/30"
        : "bg-amber-100/80 text-amber-800 border-amber-200";

    const titleClasses = isDark
        ? "text-amber-100"
        : "text-stone-900";

    const lineClasses = isDark
        ? "bg-linear-to-r from-amber-500 to-transparent"
        : "bg-linear-to-r from-amber-700 to-transparent";

    return (
        <section
            ref={sectionRef}
            className={`min-h-screen flex items-center justify-center py-20 px-6 overflow-hidden ${bgClasses}`}
        >
            <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
                {/* Lado Imagen */}
                <div
                    className={`flex justify-center relative h-[360px] md:h-[480px] w-full ${
                        side === "right" ? "md:order-2" : "md:order-1"
                    }`}
                >
                    <div
                        ref={outerRef}
                        className="relative w-full max-w-[400px] h-full flex items-center justify-center"
                    >
                        <div
                            ref={innerFloatRef}
                            className="relative w-full h-full flex items-center justify-center group"
                        >
                            {/* Halo dorado decorativo detrás de la imagen */}
                            <div className="absolute w-[280px] h-[280px] rounded-full bg-amber-500/10 blur-3xl group-hover:bg-amber-500/20 transition-all duration-700 pointer-events-none" />
                            
                            <Image
                                src={imageSrc}
                                alt={imageAlt}
                                fill
                                sizes="(max-w-768px) 100vw, 400px"
                                className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)] transform group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Lado Texto */}
                <div
                    ref={textRef}
                    className={`flex flex-col space-y-6 max-w-xl ${
                        side === "right" ? "md:order-1" : "md:order-2"
                    }`}
                >
                    <div>
                        <span
                            className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border ${badgeClasses}`}
                        >
                            {badgeText}
                        </span>
                    </div>

                    <h2
                        className={`font-serif text-4xl md:text-6xl font-bold leading-tight ${titleClasses}`}
                    >
                        {title}
                    </h2>

                    <div className={`w-20 h-[3px] rounded-full ${lineClasses}`} />

                    <p
                        className={`text-base md:text-lg leading-relaxed font-sans ${
                            isDark ? "text-stone-300" : "text-stone-700"
                        }`}
                    >
                        {description}
                    </p>

                    <div className="pt-4">
                        <button
                            type="button"
                            className={`px-8 py-3.5 rounded-2xl font-semibold tracking-wider transition-all duration-300 transform active:scale-98 ${
                                isDark
                                    ? "bg-amber-500 hover:bg-amber-600 text-stone-950 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20"
                                    : "bg-stone-950 hover:bg-stone-900 text-amber-50 shadow-lg shadow-stone-950/10 hover:shadow-stone-950/20"
                            }`}
                        >
                            Explorar Colección
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
