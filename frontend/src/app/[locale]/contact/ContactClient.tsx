"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import OptimizedVideo from "@/components/ui/OptimizedVideo";
import createGlobe from "cobe";

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
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;
        let globe: any;
        if (canvasRef.current) {
            globe = createGlobe(canvasRef.current, {
                devicePixelRatio: 2,
                width: 1000,
                height: 1000,
                phi: 0,
                theta: 0.15,
                dark: 1,
                diffuse: 1.2,
                mapSamples: 16000,
                mapBrightness: 6,
                baseColor: [0.1, 0.1, 0.1],
                markerColor: [1, 1, 1],
                glowColor: [1, 1, 1],
                markers: [
                    { location: [-16.2902, -68.1193], size: 0.1 }
                ],
                onRender: (state) => {
                    state.phi = phi;
                    phi += 0.005;
                }
            });
        }
        return () => {
            if (globe) globe.destroy();
        };
    }, []);

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black flex flex-col items-center justify-center pt-24 pb-20">
            
            {/* Background Video */}
            <div className="absolute inset-0 z-0">
                <OptimizedVideo 
                    srcMp4="/video/tallado.mp4"
                    overlayColor="rgba(0, 0, 0, 0.65)"
                    className="w-full h-full absolute inset-0"
                    style={{ position: "absolute", width: "100%", height: "100%" }}
                />
            </div>

            <div className="relative z-10 w-full max-w-[1500px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center flex-1 mt-10">
                
                {/* Left Side: Contact Info */}
                <div className="flex flex-col gap-8">
                    <h1 className="text-white text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {t("title")}
                    </h1>
                    
                    {/* Contact Boxes */}
                    <div className="flex flex-col gap-6">
                        {/* Box 1 */}
                        <div className="p-8 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]" style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(24px)" }}>
                            <h2 className="text-white/50 text-xs font-bold uppercase tracking-[0.3em] mb-2">{t("email")}</h2>
                            <p className="text-white text-3xl md:text-5xl font-black tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                                info@artesena.com
                            </p>
                        </div>
                        
                        {/* Box 2 */}
                        <div className="p-8 rounded-2xl border border-white/5 shadow-2xl" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)" }}>
                            <h2 className="text-white/50 text-xs font-bold uppercase tracking-[0.3em] mb-2">{t("phone")}</h2>
                            <p className="text-white text-3xl md:text-5xl font-black tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                                +591 2 1234567
                            </p>
                        </div>

                        {/* Box 3 */}
                        <div className="p-8 rounded-2xl border-l-4 border-white/80" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)", backdropFilter: "brightness(0.6) blur(4px)" }}>
                            <h2 className="text-white/50 text-xs font-bold uppercase tracking-[0.3em] mb-2">{t("address")}</h2>
                            <p className="text-white text-3xl md:text-5xl font-black tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                                La Paz, Bolivia
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Globe & Marquee */}
                <div className="flex flex-col items-center justify-center relative w-full h-full min-h-[600px]">
                    
                    {/* Globe */}
                    <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center lg:-mb-10 z-10 pointer-events-none">
                        <canvas
                            ref={canvasRef}
                            style={{ width: "100%", height: "100%", display: "block" }}
                        />
                    </div>

                    {/* Marquee lines below globe */}
                    <div className="w-[120vw] max-w-[2000px] overflow-hidden flex flex-col gap-2 relative z-20 pointer-events-none" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)", left: "50%", transform: "translateX(-50%)" }}>
                        
                        {/* Line 1 (Left) */}
                        <div className="flex whitespace-nowrap" style={{ width: "fit-content", animation: "scrollLeft 60s linear infinite" }}>
                            {doubledPhrases.map((phrase, i) => (
                                <span key={i} className="text-transparent font-black tracking-tighter text-5xl md:text-6xl mx-6" style={{ WebkitTextStroke: "2px rgba(255,255,255,0.9)", textShadow: "0 0 20px rgba(255,255,255,0.5)" }}>
                                    {phrase}
                                </span>
                            ))}
                        </div>
                        
                        {/* Line 2 (Right) */}
                        <div className="flex whitespace-nowrap" style={{ width: "fit-content", animation: "scrollRight 50s linear infinite" }}>
                            {doubledPhrases.map((phrase, i) => (
                                <span key={i} className="text-white font-black tracking-tighter text-4xl md:text-5xl mx-6 opacity-90" style={{ textShadow: "0 0 25px rgba(255,255,255,0.8)" }}>
                                    {phrase}
                                </span>
                            ))}
                        </div>

                        {/* Line 3 (Left) */}
                        <div className="flex whitespace-nowrap" style={{ width: "fit-content", animation: "scrollLeft 70s linear infinite" }}>
                            {doubledPhrases.map((phrase, i) => (
                                <span key={i} className="text-transparent font-black tracking-tighter text-5xl md:text-6xl mx-6" style={{ WebkitTextStroke: "1px rgba(255,255,255,0.5)", textShadow: "0 0 10px rgba(255,255,255,0.2)" }}>
                                    {phrase}
                                </span>
                            ))}
                        </div>

                    </div>
                </div>

            </div>

            <style>{`
                @keyframes scrollLeft {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                @keyframes scrollRight {
                    0% { transform: translateX(-33.33%); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
