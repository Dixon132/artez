
"use client";
import Image from "next/image";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Props {
    eyebrow: string;
    quote: string;
    description: string;
    yearsNum: string;
    yearsLabel: string;
    bgImageLeft: string;
    bgImageRight: string;
    overlayLeft?: string;
    overlayRight?: string;
}

export default function AboutQuote({ 
    eyebrow, quote, description, yearsNum, yearsLabel, 
    bgImageLeft, bgImageRight, 
    overlayLeft = "rgba(245, 240, 232, 0.93)", 
    overlayRight = "rgba(45, 53, 97, 0.75)" 
}: Props) {
    const quoteRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.fromTo(".about-quote-content > *", { x: -60, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.2, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: quoteRef.current, start: "top 75%" } });
    }, []);

    return (
        <section ref={quoteRef} style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", minHeight: "70vh", overflow: "hidden" }}>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(60px, 9vw, 110px) clamp(40px, 8vw, 100px)" }}>
                <Image src={bgImageLeft} alt="Background Left" fill style={{ objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, backgroundColor: overlayLeft }} />
                <div className="about-quote-content" style={{ position: "relative", zIndex: 1 }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "0.5em", textTransform: "uppercase", color: "#999", marginBottom: "32px" }}>{eyebrow}</p>
                    <blockquote style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(1.8rem, 4vw, 4rem)", fontWeight: 400, color: "#1a1a1a", lineHeight: 1.2, margin: "0 0 32px", borderLeft: "3px solid #C4612E", paddingLeft: "28px" }}>{quote}</blockquote>
                    <div style={{ width: "60px", height: "2px", background: "#C4612E", marginBottom: "20px" }} />
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(0.9rem, 1.3vw, 1.05rem)", color: "#444", lineHeight: 1.8, maxWidth: "480px", fontWeight: 300 }}>{description}</p>
                </div>
            </div>
            <div style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image src={bgImageRight} alt="Background Right" fill style={{ objectFit: "cover", objectPosition: "top" }} />
                <div style={{ position: "absolute", inset: 0, backgroundColor: overlayRight }} />
                <div style={{ position: "absolute", top: "15%", right: "10%", width: "160px", height: "160px", border: "1px solid rgba(255,255,255,0.2)", transform: "rotate(20deg)" }} />
                <div style={{ position: "absolute", bottom: "10%", left: "8%", width: "80px", height: "200px", background: "rgba(255,255,255,0.1)" }} />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "220px", height: "220px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)" }} />
                <div style={{ textAlign: "center", zIndex: 1 }}>
                    <p className="mix-blend-text" style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(3rem, 6vw, 6rem)", fontWeight: 800, lineHeight: 1, margin: "0 0 12px", letterSpacing: "-0.02em" }}>{yearsNum}</p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>{yearsLabel}</p>
                </div>
            </div>
        </section>
    );
}
