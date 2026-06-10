
"use client";
import Image from "next/image";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Props {
    bgImage: string;
    overlayColor?: string;
    missionNum: string;
    eyebrow: string;
    titleStartHtml: string;
    titleEm: string;
    description: string;
}

export default function AboutMission({ 
    bgImage, overlayColor = "rgba(0, 0, 0, 0.85)", 
    missionNum, eyebrow, titleStartHtml, titleEm, description 
}: Props) {
    const missionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.fromTo(".mission-content > *", { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.25, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: missionRef.current, start: "top 80%" } });
    }, []);

    return (
        <section ref={missionRef} style={{ position: "relative", minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(60px, 12vh, 140px) clamp(24px, 8vw, 120px)", textAlign: "center", overflow: "hidden" }}>
            <Image src={bgImage} alt="Mission Background" fill style={{ objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, backgroundColor: overlayColor }} />
            <p style={{ position: "absolute", fontFamily: "'Inter', sans-serif", fontSize: "clamp(12rem, 30vw, 28rem)", fontWeight: 800, color: "rgba(255,255,255,0.04)", lineHeight: 1, top: "50%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none", userSelect: "none" }}>{missionNum}</p>
            <div className="mission-content" style={{ zIndex: 1, maxWidth: "820px", position: "relative" }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "0.5em", textTransform: "uppercase", color: "#C4612E", marginBottom: "32px" }}>{eyebrow}</p>
                <h2 className="mix-blend-text" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 5.5vw, 5.5rem)", fontWeight: 700, lineHeight: 1.05, margin: "0 0 28px", letterSpacing: "-0.02em" }}>
                    <span dangerouslySetInnerHTML={{ __html: titleStartHtml }} />
                    <em style={{ color: "#C4612E", fontWeight: 400, fontStyle: "italic" }}>{titleEm}</em>
                </h2>
                <div style={{ width: "60px", height: "2px", background: "#C4612E", margin: "0 auto 28px" }} />
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(1rem, 1.6vw, 1.2rem)", color: "rgba(255,255,255,0.7)", lineHeight: 1.85, fontWeight: 300 }}>{description}</p>
            </div>
        </section>
    );
}
