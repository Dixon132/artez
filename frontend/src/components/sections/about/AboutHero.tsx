
"use client";
import Image from "next/image";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Props {
    eyebrow: string;
    title: string;
    description: string;
    quoteHtml: string;
    quoteAuthor: string;
    bgImageLeft: string;
    bgImageRight: string;
    overlayLeft?: string;
    overlayRight?: string;
}

export default function AboutHero({ 
    eyebrow, title, description, quoteHtml, quoteAuthor, 
    bgImageLeft, bgImageRight, 
    overlayLeft = "rgba(17, 17, 17, 0.85)", 
    overlayRight = "rgba(196, 97, 46, 0.75)" 
}: Props) {
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.fromTo(".about-hero-text > *", { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.2, duration: 1.3, ease: "power3.out", scrollTrigger: { trigger: heroRef.current, start: "top 80%" } });
    }, []);

    return (
        <section id="about" ref={heroRef} style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(60px, 10vw, 120px) clamp(40px, 8vw, 100px)", position: "relative", overflow: "hidden" }}>
                <Image src={bgImageLeft} alt="Background Left" fill style={{ objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, backgroundColor: overlayLeft }} />
                <div style={{ position: "absolute", inset: 0, opacity: 0.04 }}>
                    {[...Array(6)].map((_, i) => (<div key={i} style={{ position: "absolute", left: `${i * 20}%`, top: 0, bottom: 0, width: "1px", background: "#fff" }} />))}
                    {[...Array(8)].map((_, i) => (<div key={i} style={{ position: "absolute", top: `${i * 14}%`, left: 0, right: 0, height: "1px", background: "#fff" }} />))}
                </div>
                <div className="about-hero-text" style={{ position: "relative", zIndex: 1 }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "0.5em", textTransform: "uppercase", color: "#C4612E", marginBottom: "28px" }}>{eyebrow}</p>
                    <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3.5rem, 9vw, 9rem)", fontWeight: 700, color: "#fff", lineHeight: 0.95, margin: "0 0 32px", letterSpacing: "-0.03em" }}>{title}</h1>
                    <div style={{ width: "60px", height: "2px", background: "#C4612E", marginBottom: "28px" }} />
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(0.95rem, 1.5vw, 1.15rem)", color: "rgba(255,255,255,0.7)", lineHeight: 1.8, maxWidth: "400px", fontWeight: 300 }}>{description}</p>
                </div>
            </div>
            <div style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Image src={bgImageRight} alt="Background Right" fill style={{ objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, backgroundColor: overlayRight }} />
                <div style={{ position: "absolute", inset: "10%", border: "1px solid rgba(255,255,255,0.25)" }} />
                <div style={{ position: "absolute", inset: "18%", border: "1px solid rgba(255,255,255,0.15)" }} />
                <div style={{ position: "absolute", inset: "26%", border: "1px solid rgba(255,255,255,0.1)" }} />
                <div style={{ position: "absolute", top: "-20%", right: "20%", width: "2px", height: "140%", background: "rgba(255,255,255,0.2)", transform: "rotate(15deg)" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, width: "100px", height: "100px", background: "rgba(0,0,0,0.2)" }} />
                <div style={{ textAlign: "center", zIndex: 1 }}>
                    <p className="mix-blend-text" dangerouslySetInnerHTML={{ __html: quoteHtml }} style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "clamp(2rem, 5vw, 5rem)", lineHeight: 1.15, fontWeight: 400 }}></p>
                    <div style={{ width: "40px", height: "1px", background: "rgba(255,255,255,0.8)", margin: "20px auto" }} />
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>{quoteAuthor}</p>
                </div>
            </div>
        </section>
    );
}
