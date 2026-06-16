"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HomeCTA() {
    useEffect(() => {
        gsap.fromTo(".cta-left > *", { x: -50, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.15, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".cta-black-section", start: "top 75%" } });
        gsap.fromTo(".cta-right > *", { x: 50, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.15, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".cta-black-section", start: "top 75%" } });
    }, []);

    return (
        <section className="cta-black-section" style={{ background: "#000000", minHeight: "80vh", display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", gap: "80px", padding: "clamp(60px, 10vh, 120px) 10%", position: "relative", overflow: "hidden" }}>
            
            {/* Left Side */}
            <div className="cta-left" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(4.5rem, 8vw, 8rem)", fontWeight: 400, color: "#ffffff", lineHeight: 0.9, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
                    Artesena
                </h2>
                
                <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 800, color: "#FF6B00", lineHeight: 1.1, margin: "0 0 24px", letterSpacing: "-0.01em" }}>
                    Tu próximo instrumento te espera
                </h3>
                
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(1rem, 1.2vw, 1.2rem)", color: "#a3a3a3", lineHeight: 1.7, maxWidth: "500px", margin: 0, fontWeight: 400 }}>
                    Exploremos juntos, crea tu propio instrumento con nosotros y descubre la verdadera magia de la luthería boliviana.
                </p>
            </div>

            {/* Right Side */}
            <div className="cta-right" style={{ display: "flex", flexDirection: "column", gap: "60px" }}>
                
                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
                    <div>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", color: "#FF6B00", fontWeight: 800, margin: "0 0 8px", lineHeight: 1 }}>+30</p>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#8a8a8a", margin: 0 }}>Años de arte</p>
                    </div>
                    <div>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(2.5rem, 4vw, 3.5rem)", color: "#FF6B00", fontWeight: 800, margin: "0 0 8px", lineHeight: 1 }}>100%</p>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#8a8a8a", margin: 0 }}>Hecho desde cero</p>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(3.5rem, 5vw, 4.5rem)", color: "#FF6B00", fontWeight: 800, margin: "0 0 8px", lineHeight: 1 }}>∞</p>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.25em", color: "#ffffff", margin: 0 }}>Envíos a TODO EL MUNDO</p>
                    </div>
                </div>

                {/* Payment Methods */}
                <div style={{ borderTop: "1px solid #333333", paddingTop: "40px" }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#ffffff", marginBottom: "24px", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 600 }}>Nuestros métodos de pago</p>
                    <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
                        {/* PayPal Badge */}
                        <div style={{ background: "#ffffff", padding: "12px 24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#003087", fontFamily: "Arial, sans-serif", fontWeight: 900, fontStyle: "italic", fontSize: "1.2rem", letterSpacing: "-0.5px" }}>Pay<span style={{ color: "#009cde" }}>Pal</span></span>
                        </div>
                        {/* Western Union Badge */}
                        <div style={{ background: "#FFD100", padding: "12px 24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ color: "#000000", fontFamily: "Arial, sans-serif", fontWeight: 900, fontSize: "1.1rem", letterSpacing: "-0.5px" }}>Western Union</span>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                @media (max-width: 900px) {
                    .cta-black-section {
                        grid-template-columns: 1fr !important;
                        padding: 80px 5% !important;
                        text-align: left !important;
                        gap: 60px !important;
                    }
                    .cta-left h2 { font-size: 4rem !important; }
                }
            `}</style>
        </section>
    );
}
