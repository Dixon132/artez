
"use client";
import Image from "next/image";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface Craftsman {
    name: string;
    role: string;
    bgImg: string;
    colorOverlay: string;
    geo: 'circle' | 'square' | 'diamond';
}

interface Props {
    eyebrow: string;
    titleStartHtml: string;
    titleEm: string;
    titleEnd: string;
    craftsmen: Craftsman[];
}

export default function AboutCraftsmen({ eyebrow, titleStartHtml, titleEm, titleEnd, craftsmen }: Props) {
    const craftsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.fromTo(".craftsman-card", { y: 60, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, stagger: 0.18, duration: 1, ease: "power2.out", scrollTrigger: { trigger: craftsRef.current, start: "top 78%" } });
    }, []);

    return (
        <section ref={craftsRef} style={{ background: "#F5F0E8", padding: "clamp(60px, 10vh, 120px) clamp(24px, 7vw, 100px)" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "0.5em", textTransform: "uppercase", color: "#999", marginBottom: "16px" }}>{eyebrow}</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 5vw, 5rem)", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.05, margin: "0 0 60px", letterSpacing: "-0.02em" }}>
                    <span dangerouslySetInnerHTML={{ __html: titleStartHtml }} />
                    <em style={{ color: "#C4612E", fontWeight: 400 }}>{titleEm}</em>
                    {titleEnd}
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px" }}>
                    {craftsmen.map((craftsman, i) => (
                        <div key={i} className="craftsman-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div className="about-craft-img-hover" style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Image src={craftsman.bgImg} alt={craftsman.name} fill style={{ objectFit: "cover" }} />
                                <div style={{ position: "absolute", inset: 0, backgroundColor: craftsman.colorOverlay }} />
                                {craftsman.geo === "circle" && <div style={{ position: "relative", width: "120px", height: "120px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)" }} />}
                                {craftsman.geo === "square" && <div style={{ position: "relative", width: "100px", height: "100px", border: "2px solid rgba(255,255,255,0.4)", transform: "rotate(8deg)" }} />}
                                {craftsman.geo === "diamond" && <div style={{ position: "relative", width: "90px", height: "90px", border: "2px solid rgba(255,255,255,0.4)", transform: "rotate(45deg)" }} />}
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 20px 16px", background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}>
                                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.2 }}>{craftsman.name}</p>
                                </div>
                            </div>
                            <div>
                                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "0.35em", textTransform: "uppercase", color: "#666", marginBottom: "6px" }}>{craftsman.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
