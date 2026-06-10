
"use client";
import { useVantaWaves } from "@/hooks/useVantaWaves";
import { useHeroAnimations } from "@/hooks/useHeroAnimations";
import { useTranslations } from "next-intl";

const titleLetters = "ARTESENA".split("");

export default function HomeHero() {
    const t = useTranslations("home");
    const containerRef = useVantaWaves(0xf59e0b, true);
    useHeroAnimations(true);

    return (
        <div
            ref={containerRef as any}
            style={{
                position: "relative",
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
            }}
        >
            <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.45) 100%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px", pointerEvents: "none" }}>
                <p style={{ fontSize: "11px", letterSpacing: "0.5em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: "20px", fontFamily: "'DM Sans', sans-serif" }}>
                    {t("heroEyebrow")}
                </p>
                <div style={{ position: "relative", zIndex: 10, textAlign: "center", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "center", overflow: "hidden" }}>
                        {titleLetters.map((char, i) => (
                            <span key={i} className="hero-letter" style={{ display: "inline-block", fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3.5rem, 10vw, 11rem)", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", lineHeight: 1, textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                                {char}
                            </span>
                        ))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", marginLeft: "clamp(40px, 10vw, 100px)", flexWrap: "wrap", marginTop: "-20px" }}>
                        <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: "clamp(2rem, 4vw, 4rem)", transform: "rotate(-4deg)", textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
                            {t("heroCursive")}
                        </span>
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 8vw, 8rem)", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 0.8, textShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                            {t("heroSerif")}
                        </span>
                    </div>
                </div>
                <p className="hero-desc" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(0.85rem, 1.3vw, 1.1rem)", color: "rgba(255,255,255,0.75)", lineHeight: 1.7, maxWidth: "480px", fontWeight: 300 }}>
                    {t("subtitle")}
                </p>
            </div>
            <div style={{ position: "absolute", bottom: "36px", left: "50%", transform: "translateX(-50%)", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", animation: "scrollBounce 2s ease-in-out infinite" }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
                    {t("scroll")}
                </p>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
                    <path d="M10 3v14M4 11l6 6 6-6" />
                </svg>
            </div>
            <style>{`
                @keyframes scrollBounce {
                    0%, 100% { transform: translateX(-50%) translateY(0); }
                    50% { transform: translateX(-50%) translateY(8px); }
                }
            `}</style>
        </div>
    );
}
