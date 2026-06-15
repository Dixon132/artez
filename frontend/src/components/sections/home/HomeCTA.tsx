"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export default function HomeCTA() {
    const t = useTranslations("home");

    useEffect(() => {
        gsap.fromTo(".cta-content > *", { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".cta-section", start: "top 70%" } });
        gsap.fromTo(".cta-stat", { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".cta-stats-container", start: "top 85%" } });
    }, []);

    return (
        <section className="cta-section" style={{ position: "relative", minHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", textAlign: "center", padding: "100px 20px" }}>
            
            {/* Immersive Background */}
            <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                <Image 
                    src="/img/art/art1.png" 
                    alt="Fondo Charango" 
                    fill 
                    style={{ objectFit: "cover", objectPosition: "center" }} 
                    quality={90}
                />
                {/* Heavy Warm Cream Overlay */}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(245, 240, 232, 0.88), rgba(245, 240, 232, 0.95))" }} />
                {/* Subtle vignette/border burn */}
                <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 150px rgba(196, 97, 46, 0.15)", pointerEvents: "none" }} />
            </div>

            <div className="cta-content" style={{ position: "relative", zIndex: 1, maxWidth: "900px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                
                {/* Decorative top element */}
                <div style={{ width: "2px", height: "60px", background: "#C4612E", marginBottom: "30px" }} />

                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase", color: "#C4612E", marginBottom: "24px", fontWeight: 600 }}>
                    {t("ctaEyebrow")}
                </p>
                
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 8vw, 7rem)", fontWeight: 400, color: "#1c1917", lineHeight: 0.95, margin: "0 0 24px", letterSpacing: "-0.02em" }}>
                    <span dangerouslySetInnerHTML={{ __html: t("ctaTitle") }} />
                    <br />
                    <em style={{ color: "#C4612E", fontStyle: "italic" }}>{t("ctaTitleEm")}</em>
                    <span dangerouslySetInnerHTML={{ __html: t("ctaTitleEnd") }} />
                </h2>
                
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(1rem, 1.4vw, 1.2rem)", color: "#5c5955", lineHeight: 1.8, maxWidth: "550px", margin: "0 auto 48px", fontWeight: 400 }}>
                    {t("ctaDesc")}
                </p>
                
                <Link href="/products">
                    <button className="cta-btn-rustic" style={{ display: "inline-flex", alignItems: "center", gap: "12px", padding: "18px 50px", border: "1px solid #1c1917", background: "transparent", color: "#1c1917", fontFamily: "'DM Sans', sans-serif", fontSize: "12px", letterSpacing: "0.25em", textTransform: "uppercase", cursor: "pointer" }}>
                        <span>{t("ctaBtn")}</span>
                    </button>
                </Link>

                {/* Stats Container */}
                <div className="cta-stats-container" style={{ display: "flex", gap: "clamp(20px, 5vw, 80px)", justifyContent: "center", marginTop: "100px", flexWrap: "wrap", width: "100%", maxWidth: "800px", borderTop: "1px solid rgba(196, 97, 46, 0.2)", paddingTop: "60px" }}>
                    {[
                        { num: t("stat1Num"), label: t("stat1Label") },
                        { num: t("stat2Num"), label: t("stat2Label") },
                        { num: t("stat3Num"), label: t("stat3Label") },
                    ].map((item, i) => (
                        <div key={i} className="cta-stat" style={{ textAlign: "center", flex: "1 1 min-content" }}>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 5vw, 4.5rem)", fontWeight: 300, color: "#1c1917", lineHeight: 1, margin: "0 0 16px" }}>{item.num}</p>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: "#8a8580", whiteSpace: "nowrap" }}>{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                .cta-btn-rustic { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
                .cta-btn-rustic:hover { background: #1c1917 !important; color: #F5F0E8 !important; border-color: #1c1917 !important; transform: translateY(-3px); box-shadow: 0 15px 30px rgba(0,0,0,0.1); }
            `}</style>
        </section>
    );
}
