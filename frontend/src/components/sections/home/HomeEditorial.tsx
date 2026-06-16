"use client";
import FloatingOrb from "@/components/ui/FloatingOrb";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import Image from "next/image";

interface Props {
    bgImageLeft?: string;
    overlayLeft?: string;
    bgImageRight?: string;
    overlayRight?: string;
    bgVideo?: string;
}

export default function HomeEditorial({ 
    bgImageLeft, 
    overlayLeft = "rgba(196, 97, 46, 0.75)", 
    bgImageRight, 
    overlayRight = "rgba(245, 240, 232, 0.9)",
    bgVideo
}: Props) {
    const t = useTranslations("home");

    useEffect(() => {
        gsap.fromTo(".editorial-panel", { x: -80, opacity: 0 }, { x: 0, opacity: 1, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".editorial-block", start: "top 75%" } });
        gsap.fromTo(".editorial-text-block > *", { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".editorial-block", start: "top 70%" } });
    }, []);

    return (
        <section className="editorial-block" style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", minHeight: "70vh", overflow: "hidden", position: "relative", background: "#F5F0E8" }}>
            {bgVideo && (
                <video 
                    src={bgVideo}
                    autoPlay muted loop playsInline preload="metadata"
                    style={{
                        position: "absolute",
                        top: 0, left: 0, width: "100%", height: "100%",
                        objectFit: "cover",
                        zIndex: 0
                    }}
                />
            )}
            
            
            
            <div className="editorial-panel" style={{ background: bgVideo ? overlayLeft : "#C4612E", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", zIndex: 1 }}>
                {!bgVideo && bgImageLeft && <Image src={bgImageLeft} alt="Background" fill style={{ objectFit: "cover" }} />}
                {!bgVideo && bgImageLeft && <div style={{ position: "absolute", inset: 0, backgroundColor: overlayLeft }} />}
                <div style={{ position: "absolute", top: "10%", left: "8%", width: "120px", height: "120px", border: "1px solid rgba(255,255,255,0.25)" }} />
                <div style={{ position: "absolute", top: "14%", left: "12%", width: "100px", height: "100px", border: "1px solid rgba(255,255,255,0.15)" }} />
                <div style={{ position: "absolute", bottom: "15%", right: "10%", width: "80px", height: "200px", background: "rgba(255,255,255,0.06)" }} />
                <div style={{ position: "absolute", bottom: "30%", left: "5%", width: "40px", height: "40px", background: "rgba(255,255,255,0.1)", transform: "rotate(45deg)" }} />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "200px", height: "200px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)" }} />
                <div style={{ textAlign: "center", zIndex: 2 }}>
                    <p style={{ fontSize: "10px", letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", fontFamily: "'DM Sans', sans-serif", marginBottom: "16px" }}>{t("originEyebrow")}</p>
                    <p dangerouslySetInnerHTML={{ __html: t("originTitle") }} style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "#fff", lineHeight: 1.1, fontWeight: 400 }} />
                    <div style={{ width: "48px", height: "2px", background: "rgba(255,255,255,0.5)", margin: "20px auto 0" }} />
                </div>
            </div>
            
            <div className="editorial-text-block" style={{ background: bgVideo ? overlayRight : "#F5F0E8", position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(40px, 8vw, 100px) clamp(36px, 7vw, 90px)", zIndex: 1 }}>
                {!bgVideo && bgImageRight && <Image src={bgImageRight} alt="Background" fill style={{ objectFit: "cover" }} />}
                {!bgVideo && bgImageRight && <div style={{ position: "absolute", inset: 0, backgroundColor: overlayRight }} />}
                <div style={{ position: "relative", zIndex: 2 }}>
                    <p style={{ fontSize: "10px", letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", fontFamily: "'DM Sans', sans-serif", marginBottom: "28px" }}>{t("editorialEyebrow")}</p>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.4rem, 5.5vw, 5.5rem)", fontWeight: 700, color: "#ffffff", lineHeight: 1.05, margin: "0 0 28px", letterSpacing: "-0.02em" }}>
                        <span dangerouslySetInnerHTML={{ __html: t("editorialTitle") }} />
                        <em style={{ color: "#C4612E", fontWeight: 400 }}>{t("editorialTitleEm")}</em>
                    </h2>
                    <div style={{ width: "60px", height: "2px", background: "#C4612E", marginBottom: "28px" }} />
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(0.95rem, 1.4vw, 1.15rem)", color: "rgba(255,255,255,0.75)", lineHeight: 1.8, maxWidth: "440px", marginBottom: "40px", fontWeight: 300 }}>{t("editorialDesc")}</p>
                    <Link href="/products">
                        <button className="editorial-hover-btn" style={{ display: "inline-block", padding: "14px 40px", border: "1.5px solid rgba(255,255,255,0.7)", background: "transparent", color: "#ffffff", fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", cursor: "pointer" }}>{t("viewCollection")}</button>
                    </Link>
                </div>
            </div>
            <style>{`
                .editorial-hover-btn { transition: background 0.3s ease, color 0.3s ease, transform 0.2s ease; }
                .editorial-hover-btn:hover { background: #ffffff !important; color: #1c1917 !important; transform: translateY(-2px); }
                @media (max-width: 768px) {
                    .editorial-block { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </section>
    );
}
