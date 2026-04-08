"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HorizontalSection from "@/components/layout/HorizontalSection";
import FanSection from "@/components/layout/FanSection";

gsap.registerPlugin(ScrollTrigger);

const titleLetters = "ARTESENA".split("");

export default function HomePage() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Vanta
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
                    color: 0xf59e0b,
                    shininess: 60,
                    waveHeight: 20,
                    waveSpeed: 1,
                    zoom: 0.8,
                });
            });
        });

        return () => { effect?.destroy(); };
    }, []);

    // GSAP hero
    useEffect(() => {
        const tl = gsap.timeline({ delay: 0.3 });
        tl.fromTo(".hero-side-left",
            { opacity: 0, x: -40 },
            { opacity: 1, x: 0, duration: 1.2, ease: "power3.out" }
        )
        .fromTo(".hero-letter",
            { y: 140, opacity: 0, rotateX: -90 },
            { y: 0, opacity: 1, rotateX: 0, duration: 1, ease: "power4.out", stagger: 0.06 },
            "-=0.8"
        )
        .fromTo(".hero-side-right",
            { opacity: 0, x: 40 },
            { opacity: 1, x: 0, duration: 1.2, ease: "power3.out" },
            "-=0.8"
        )
        .fromTo(".hero-sub",
            { opacity: 0, letterSpacing: "0.6em" },
            { opacity: 1, letterSpacing: "0.25em", duration: 1.2, ease: "power3.out" },
            "-=0.6"
        )
        .fromTo(".hero-desc",
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
            "-=0.6"
        )
        .fromTo(".hero-scroll",
            { opacity: 0 },
            { opacity: 1, duration: 1 },
            "-=0.2"
        );
    }, []);

    return (
        <main style={{ fontFamily: "'Cormorant Garamond', serif" }}>

            {/* ── SECCIÓN 1 — Hero ── */}
            <div
                ref={containerRef}
                style={{ width: "100vw", height: "100vh" }}
                className="relative overflow-hidden"
            >
                <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 100%)" }} />

                <div className="absolute inset-0 z-10 flex items-center justify-between px-10 md:px-20 pointer-events-none">

                    {/* Columna izquierda */}
                    <div className="hero-side-left hidden md:flex flex-col gap-6 text-white/70 text-sm max-w-[160px]">
                        <div style={{ borderLeft: "1px solid rgba(245,158,11,0.5)", paddingLeft: "1rem" }}>
                            <p className="text-amber-400 font-semibold uppercase tracking-widest text-xs mb-1">Origen</p>
                            <p className="leading-relaxed">Andes de Bolivia y Perú</p>
                        </div>
                        <div style={{ borderLeft: "1px solid rgba(245,158,11,0.5)", paddingLeft: "1rem" }}>
                            <p className="text-amber-400 font-semibold uppercase tracking-widest text-xs mb-1">Tradición</p>
                            <p className="leading-relaxed">+500 años de historia</p>
                        </div>
                        <div style={{ borderLeft: "1px solid rgba(245,158,11,0.5)", paddingLeft: "1rem" }}>
                            <p className="text-amber-400 font-semibold uppercase tracking-widest text-xs mb-1">Material</p>
                            <p className="leading-relaxed">Madera noble & cuerdas de nailon</p>
                        </div>
                    </div>

                    {/* Centro */}
                    <div className="flex flex-col items-center text-center">
                        <div className="flex gap-0 md:gap-1" style={{ perspective: "600px" }}>
                            {titleLetters.map((l, i) => (
                                <span
                                    key={i}
                                    className="hero-letter inline-block text-[5rem] md:text-[10rem] lg:text-[13rem] font-bold text-white leading-none"
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        textShadow: "2px 2px 0px rgba(0,0,0,0.4), 6px 6px 0px rgba(0,0,0,0.2), 0 0 80px rgba(245,158,11,0.3)",
                                    }}
                                >
                                    {l}
                                </span>
                            ))}
                        </div>
                        <p className="hero-sub mt-3 text-amber-400 text-xl md:text-3xl font-semibold" style={{ fontStyle: "italic" }}>
                            El Alma Andina en tus Manos
                        </p>
                        <p className="hero-desc mt-4 text-white/80 text-sm md:text-base leading-relaxed max-w-sm">
                            Charangos, Ronrocos y Walaychos —<br />extensiones del espíritu andino.
                        </p>
                    </div>

                    {/* Columna derecha */}
                    <div className="hero-side-right hidden md:flex flex-col gap-6 text-white/70 text-sm max-w-[160px] items-end text-right">
                        <div style={{ borderRight: "1px solid rgba(245,158,11,0.5)", paddingRight: "1rem" }}>
                            <p className="text-amber-400 font-semibold uppercase tracking-widest text-xs mb-1">Instrumentos</p>
                            <p className="leading-relaxed">Charango · Ronroco · Walacho</p>
                        </div>
                        <div style={{ borderRight: "1px solid rgba(245,158,11,0.5)", paddingRight: "1rem" }}>
                            <p className="text-amber-400 font-semibold uppercase tracking-widest text-xs mb-1">Hecho en</p>
                            <p className="leading-relaxed">Bolivia</p>
                        </div>
                        <div style={{ borderRight: "1px solid rgba(245,158,11,0.5)", paddingRight: "1rem" }}>
                            <p className="text-amber-400 font-semibold uppercase tracking-widest text-xs mb-1">Envíos</p>
                            <p className="leading-relaxed">A todo el mundo</p>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50 text-xs uppercase tracking-widest pointer-events-none">
                    <span>Scroll</span>
                    <div style={{
                        width: "1px", height: "48px",
                        background: "linear-gradient(to bottom, rgba(245,158,11,0.8), transparent)",
                    }} />
                </div>
            </div>

            {/* ── SECCIÓN 2 — Scroll horizontal ── */}
            <HorizontalSection />

            {/* ── SECCIÓN 3 — Abanico (última) ── */}
            <FanSection />

        </main>
    );
}
