"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useVantaWaves } from "@/hooks/useVantaWaves";

gsap.registerPlugin(ScrollTrigger);

export default function HomeArtisanPride() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    
    // Use Vanta Waves with purple color
    const vantaRef = useVantaWaves(0x6b21a8, true);
    
    useEffect(() => {
        if (textRef.current && sectionRef.current) {
            gsap.fromTo(
                textRef.current.children,
                { y: 40, opacity: 0 },
                {
                    y: 0, opacity: 1, stagger: 0.15, duration: 1.5, ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                    }
                }
            );
        }
    }, []);

    return (
        <section
            ref={sectionRef}
            style={{
                position: "relative",
                minHeight: "50vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Inter:wght@700;800&family=DM+Sans:wght@600&family=Cormorant+Garamond:wght@300&display=swap');
            `}</style>

            {/* Background Vanta Waves */}
            <div ref={vantaRef} style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                {/* Subtle overlay to ensure text readability over the waves if needed */}
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />
            </div>

            {/* Layered Typography */}
            <div ref={textRef} style={{ position: "relative", zIndex: 10, textAlign: "center", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                
                {/* Cursive: "Creado por" */}
                <div style={{
                    fontFamily: "'Great Vibes', cursive",
                    fontSize: "clamp(2.5rem, 5vw, 4rem)",
                    lineHeight: 0.5,
                    marginRight: "clamp(40px, 10vw, 120px)", marginBottom: "10px",
                    transform: "rotate(-4deg)",
                    textShadow: "0 2px 10px rgba(0,0,0,0.2)"
                }}>
                    Creado por
                </div>

                {/* Massive Sans: "ARTESANOS" */}
                <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "clamp(2.5rem, 8vw, 8rem)",
                    fontWeight: 800,
                    letterSpacing: "0.02em",
                    lineHeight: 1,
                    textShadow: "0 4px 20px rgba(0,0,0,0.3)"
                }}>
                    ARTESANOS
                </div>

                {/* Spaced Sans: "BOLIVIA" */}
                <div style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "clamp(0.8rem, 1.5vw, 1.2rem)",
                    fontWeight: 600,
                    letterSpacing: "0.5em",
                    lineHeight: 1,
                    marginTop: "-5px", marginBottom: "5px",
                    marginBottom: "20px",
                    textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                    textTransform: "uppercase"
                }}>
                    Bolivia
                </div>

                {/* Cursive "para" + Serif "EL MUNDO" */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", marginLeft: "clamp(40px, 10vw, 100px)", flexWrap: "wrap" }}>
                    <span style={{
                        fontFamily: "'Great Vibes', cursive",
                        fontSize: "clamp(1.8rem, 3vw, 3rem)",
                        transform: "rotate(-4deg)",
                        textShadow: "0 2px 10px rgba(0,0,0,0.2)"
                    }}>
                        para
                    </span>
                    <span style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "clamp(2.5rem, 7vw, 7rem)",
                        fontWeight: 300,
                        letterSpacing: "-0.02em",
                        lineHeight: 0.8,
                        textShadow: "0 4px 20px rgba(0,0,0,0.3)"
                    }}>
                        EL MUNDO
                    </span>
                </div>
            </div>
            
            {/* Small text corner */}
            <div style={{
                position: "absolute",
                bottom: "40px",
                left: "40px",
                fontFamily: "'Great Vibes', cursive",
                fontSize: "2rem",
                color: "#fff",
                textShadow: "0 2px 10px rgba(0,0,0,0.2)"
            }}>
                Ya Disponible
            </div>
        </section>
    );
}
