"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import OptimizedVideo from "@/components/ui/OptimizedVideo";

// ssr:false is CRITICAL — cobe uses WebGL which cannot run on the server.
// Without this, Next.js tries to render the canvas server-side,
// silently producing a broken WebGL context that shows only a black circle.
const GlobeCanvas = dynamic(() => import("./GlobeCanvas"), { ssr: false });

const marqueePhrases = [
    "ENVÍOS MUNDIALMENTE",
    "WORLDWIDE SHIPPING",
    "LIVRAISON MONDIALE",
    "SPEDIZIONE IN TUTTO IL MONDO",
    "WELTWEITER VERSAND",
    "ENVIO PARA TODO O MUNDO",
    "全世界配送",
    "ДОСТАВКА ПО ВСЕМУ МИРУ",
    "الشحن في جميع أنحاء العالم",
    "전 세계 배송"
];

const doubledPhrases = [...marqueePhrases, ...marqueePhrases, ...marqueePhrases];

export default function ContactClient() {
    const t = useTranslations("contact");

    return (
        <div style={{
            position: "relative",
            minHeight: "100vh",
            width: "100%",
            overflow: "hidden",
            background: "#000",
            display: "flex",
            flexDirection: "column",
            paddingTop: 80
        }}>
            {/* Background Video */}
            <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
                <OptimizedVideo
                    srcMp4="/video/tallado.mp4"
                    overlayColor="rgba(0,0,0,0.7)"
                    className="w-full h-full absolute inset-0"
                    style={{ position: "absolute", width: "100%", height: "100%" }}
                />
            </div>

            {/* Main grid */}
            <div style={{
                position: "relative",
                zIndex: 20,
                flex: 1,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                alignItems: "stretch",
                maxWidth: 1400,
                width: "100%",
                margin: "0 auto",
                padding: "60px 32px 40px",
                gap: 40,
                overflow: "hidden"
            }}>
                {/* LEFT — Contact boxes */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <h1 style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "clamp(2.8rem, 7vw, 6rem)",
                        fontWeight: 900,
                        color: "#fff",
                        textTransform: "uppercase",
                        letterSpacing: "-0.03em",
                        lineHeight: 0.9,
                        margin: "0 0 16px"
                    }}>
                        {t("title")}
                    </h1>

                    {[
                        { label: t("email"), value: "info@artesena.com" },
                        { label: t("phone"), value: "+591 2 1234567" },
                        { label: t("address"), value: "La Paz, Bolivia" },
                    ].map((item, i) => (
                        <div key={i} style={{
                            padding: "24px 28px",
                            borderRadius: 14,
                            border: i === 2 ? "none" : "1px solid rgba(255,255,255,0.1)",
                            borderLeft: i === 2 ? "4px solid rgba(255,255,255,0.8)" : undefined,
                            background: i === 0
                                ? "rgba(255,255,255,0.05)"
                                : i === 1
                                    ? "rgba(0,0,0,0.55)"
                                    : "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
                            backdropFilter: "blur(16px)",
                        }}>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: "0 0 8px" }}>{item.label}</p>
                            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(1.3rem, 2.5vw, 2.2rem)", fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* RIGHT — Globe via dynamic import (ssr:false guarantees WebGL only runs client-side) */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
                    <GlobeCanvas />
                </div>
            </div>

            {/* Marquee — below everything, in normal document flow */}
            <div style={{
                position: "relative",
                zIndex: 10,
                width: "100%",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                paddingBottom: 48,
                maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
                WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            }}>
                {[
                    { dir: "scrollLeft", size: "clamp(2.2rem, 4vw, 3.8rem)", stroke: "2px rgba(255,255,255,0.9)", solid: false, duration: "60s" },
                    { dir: "scrollRight", size: "clamp(1.8rem, 3.5vw, 3.2rem)", stroke: undefined, solid: true, duration: "50s" },
                    { dir: "scrollLeft", size: "clamp(2.2rem, 4vw, 3.8rem)", stroke: "1px rgba(255,255,255,0.4)", solid: false, duration: "70s" },
                ].map((row, ri) => (
                    <div key={ri} style={{ display: "flex", whiteSpace: "nowrap", width: "fit-content", animation: `${row.dir} ${row.duration} linear infinite` }}>
                        {doubledPhrases.map((p, i) => (
                            <span key={i} style={{
                                fontFamily: "'Inter', sans-serif",
                                fontWeight: 900,
                                fontSize: row.size,
                                letterSpacing: "-0.02em",
                                marginInline: 20,
                                color: row.solid ? "#fff" : "transparent",
                                WebkitTextStroke: row.stroke,
                                textShadow: row.solid ? "0 0 25px rgba(255,255,255,0.8)" : "0 0 15px rgba(255,255,255,0.4)",
                            }}>{p}</span>
                        ))}
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes scrollLeft {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                }
                @keyframes scrollRight {
                    0% { transform: translateX(-33.333%); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
