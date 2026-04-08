"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        const track = trackRef.current;
        if (!section || !track) return;

        const slideWidth = window.innerWidth;
        const totalScroll = slideWidth * 2;

        const st = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: `+=${totalScroll}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                gsap.set(track, { x: -totalScroll * self.progress });
            },
        });

        return () => st.kill();
    }, []);

    return (
        <div ref={sectionRef} style={{ height: "100vh", overflow: "hidden" }}>
            <div ref={trackRef} style={{ display: "flex", width: "300vw", height: "100%" }}>

                {/* ── SLIDE 1 — Hecho a mano ── */}
                <div style={{
                    width: "100vw", height: "100vh", flexShrink: 0,
                    background: "linear-gradient(135deg, #1a0a00 0%, #2d1500 50%, #1a0a00 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <div style={{ textAlign: "center", maxWidth: "640px", padding: "0 60px" }}>
                        <p style={{ fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", color: "#f59e0b", marginBottom: "20px" }}>El Arte del Instrumento</p>
                        <h2 style={{ fontSize: "80px", fontWeight: 700, color: "#fef3c7", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1, marginBottom: "12px" }}>
                            Hecho
                        </h2>
                        <h2 style={{ fontSize: "80px", fontWeight: 700, color: "#f59e0b", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", lineHeight: 1, marginBottom: "28px" }}>
                            a mano
                        </h2>
                        <div style={{ width: "60px", height: "2px", background: "linear-gradient(to right, #f59e0b, transparent)", margin: "0 auto 28px" }} />
                        <p style={{ fontSize: "17px", color: "rgba(254,243,199,0.65)", lineHeight: 1.8 }}>
                            Cada instrumento nace de la tierra, tallado con paciencia ancestral y terminado con el rigor de quien sabe que está creando arte.
                        </p>
                    </div>
                </div>

                {/* ── SLIDE 2 ── */}
                <div style={{
                    width: "100vw", height: "100vh", flexShrink: 0,
                    background: "#292524",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <div style={{ textAlign: "center", maxWidth: "640px", padding: "0 60px" }}>
                        <p style={{ fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", color: "#78716c", marginBottom: "20px" }}>02 / 03</p>
                        <h2 style={{ fontSize: "80px", fontWeight: 700, color: "#fbbf24", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1, marginBottom: "28px" }}>
                            Tradición
                        </h2>
                        <div style={{ width: "60px", height: "2px", background: "linear-gradient(to right, #fbbf24, transparent)", margin: "0 auto 28px" }} />
                        <p style={{ fontSize: "17px", color: "#d6d3d1", lineHeight: 1.8 }}>
                            Técnicas transmitidas por generaciones de artesanos bolivianos que guardan el secreto de la madera que canta.
                        </p>
                    </div>
                </div>

                {/* ── SLIDE 3 ── */}
                <div style={{
                    width: "100vw", height: "100vh", flexShrink: 0,
                    background: "#0c0a09",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <div style={{ textAlign: "center", maxWidth: "640px", padding: "0 60px" }}>
                        <p style={{ fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", color: "#57534e", marginBottom: "20px" }}>03 / 03</p>
                        <h2 style={{ fontSize: "80px", fontWeight: 700, color: "#ffffff", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1, marginBottom: "28px" }}>
                            Tu historia
                        </h2>
                        <div style={{ width: "60px", height: "2px", background: "linear-gradient(to right, #ffffff, transparent)", margin: "0 auto 28px" }} />
                        <p style={{ fontSize: "17px", color: "#a8a29e", lineHeight: 1.8 }}>
                            Personaliza cada detalle para que sea único como tú. Un instrumento hecho para tu voz, tu ritmo, tu alma.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
