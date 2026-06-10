
"use client";
import FloatingOrb from "@/components/ui/FloatingOrb";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HomeCTA() {
    const t = useTranslations("home");

    useEffect(() => {
        gsap.fromTo(".cta-content > *", { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.2, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".cta-section", start: "top 80%" } });
    }, []);

    return (
        <section className="cta-section" style={{ background: "#0e0e0e", minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "clamp(60px, 10vh, 120px) clamp(24px, 6vw, 80px)", position: "relative", overflow: "hidden", textAlign: "center" }}>
            <FloatingOrb size="250px" color1="#2D3561" color2="#4f46e5" bottom="-100px" left="-50px" delay={0.2} />
            <FloatingOrb size="120px" color1="#C4612E" color2="#ef4444" top="10%" right="10%" delay={0.5} />
            <div style={{ position: "absolute", top: "10%", left: "5%", width: "180px", height: "180px", border: "1px solid rgba(196,97,46,0.2)", transform: "rotate(12deg)" }} />
            <div style={{ position: "absolute", bottom: "10%", right: "6%", width: "120px", height: "340px", background: "rgba(196,97,46,0.06)" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.03)", pointerEvents: "none" }} />
            <div className="cta-content" style={{ zIndex: 1, maxWidth: "900px" }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "0.5em", textTransform: "uppercase", color: "#C4612E", marginBottom: "32px" }}>{t("ctaEyebrow")}</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 9vw, 10rem)", fontWeight: 700, color: "#ffffff", lineHeight: 0.95, margin: "0 0 24px", letterSpacing: "-0.03em" }}>
                    <span dangerouslySetInnerHTML={{ __html: t("ctaTitle") }} />
                    <em style={{ color: "#C4612E", fontWeight: 400, fontStyle: "italic" }}>{t("ctaTitleEm")}</em>
                    <span dangerouslySetInnerHTML={{ __html: t("ctaTitleEnd") }} />
                </h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(0.9rem, 1.5vw, 1.15rem)", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, maxWidth: "480px", margin: "0 auto 52px", fontWeight: 300 }}>{t("ctaDesc")}</p>
                <Link href="/products">
                    <button className="cta-btn-hover" style={{ padding: "18px 60px", border: "1.5px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "11px", letterSpacing: "0.3em", textTransform: "uppercase", cursor: "pointer" }}>{t("ctaBtn")}</button>
                </Link>
                <div style={{ display: "flex", gap: "48px", justifyContent: "center", marginTop: "80px", flexWrap: "wrap" }}>
                    {[
                        { num: t("stat1Num"), label: t("stat1Label") },
                        { num: t("stat2Num"), label: t("stat2Label") },
                        { num: t("stat3Num"), label: t("stat3Label") },
                    ].map((item, i) => (
                        <div key={i} style={{ textAlign: "center" }}>
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, color: "#fff", lineHeight: 1, margin: "0 0 8px" }}>{item.num}</p>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
            <style>{`
                .cta-btn-hover { transition: background 0.3s ease, color 0.3s ease, letter-spacing 0.3s ease, transform 0.2s ease; }
                .cta-btn-hover:hover { background: #C4612E !important; color: #fff !important; letter-spacing: 0.25em; transform: translateY(-3px); }
            `}</style>
        </section>
    );
}
