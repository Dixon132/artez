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

        // Balanceo infinito de la imagen
        gsap.to(".mi-imagen", {
            x: 20,
            duration: 2,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
        });

        // Fade-in de los textos del slide 1
        gsap.from(".slide1-text p", {
            opacity: 0,
            y: 30,
            stagger: 0.3,
            duration: 1.2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".slide1-text",
                start: "top 80%",
            },
        });

        return () => st.kill();
    }, []);

    return (
        <div ref={sectionRef} style={{ height: "100vh", overflow: "hidden" }}>
            <div ref={trackRef} style={{ display: "flex", width: "300vw", height: "100%" }}>

                {/* ── SLIDE 1 — Hecho a mano ── */}
                <div className="font-aldrich w-full h-full bg-linear-to-br bg-[#E8DCC8] bg-[url('/noise4.png')] bg-repeat opacity-90 flex items-center justify-around p-10">
                    <img
                        src="/img/art/art1.png"
                        alt="Decoración"
                        className="mi-imagen w-1/3 h-auto drop-shadow-2xl"
                    />
                    <div className="slide1-text max-w-xl text-justify space-y-6 leading-relaxed border-l-4 border-[#2F5D57] pl-6">
                        <p className="text-[#2F5D57] font-bold text-[3rem]">
                            La Construcción: Un Acto de Amor y Tradición
                        </p>
                        <p className="text-[#4E8A7F] text-[1.5rem]">
                            La creación de un charango es un proceso artesanal que fusiona la habilidad del luthier con la mística de la naturaleza.
                        </p>
                        <p className="text-[#3F6B5E] text-[1.5rem]">
                            Antiguamente, se utilizaba el caparazón de armadillo (quirquincho) para su caja de resonancia.
                        </p>
                        <p className="text-[#6F8F87] text-[1.5rem]">
                            Hoy en día, por razones éticas y de conservación, se emplean maderas nobles cuidadosamente seleccionadas. Entre las más apreciadas se encuentran el Naranjillo, el Cedro y el Tarco, cada una aportando características únicas al timbre y la resonancia del instrumento.
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
