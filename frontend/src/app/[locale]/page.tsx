"use client";

import HorizontalSection from "@/components/layout/HorizontalSection";
import FanSection from "@/components/layout/FanSection";
import { useVantaWaves } from "@/hooks/useVantaWaves";
import { useHeroAnimations } from "@/hooks/useHeroAnimations";

const titleLetters = "ARTESENA".split("");

export default function HomePage() {
    const containerRef = useVantaWaves(0xf59e0b);
    useHeroAnimations();

    return (
        <main className="font-['Cormorant_Garamond',serif]">
            {/* Hero */}
            <div ref={containerRef} className="relative w-screen h-screen overflow-hidden">
                <div className="absolute inset-0 z-1 bg-linear-to-b from-black/10 to-black/10" />

                <div className="absolute inset-0 z-10 w-screen flex items-center justify-center px-10 md:px-20 pointer-events-none">
                    <div className="font-aldrich   flex flex-col items-center text-center">
                        <div className="flex font-cormorant gap-0 md:gap-1" style={{ perspective: "600px" }}>
                            {titleLetters.map((l, i) => (
                                <span
                                    key={i}
                                    className="hero-letter inline-block text-[5rem] md:text-[10rem] lg:text-[13rem] font-bold text-white leading-none"
                                    style={{
                                        textShadow: "2px 2px 0px rgba(0,0,0,0.4), 6px 6px 0px rgba(0,0,0,0.2), 0 0 80px rgba(245,158,11,0.3)",
                                    }}
                                >
                                    {l}
                                </span>
                            ))}
                        </div>
                        <p className="hero-sub mt-3  text-xl md:text-3xl font-semibold italic">
                            El Alma Andina en tus Manos
                        </p>
                        <p className="hero-desc mt-4  text-sm md:text-base leading-relaxed max-w-sm">
                            Charangos, Ronrocos y Walaychos <br />extensiones del espíritu andino.
                        </p>

                        <div className="flex items-center justify-between gap-8 mt-10 w-full max-w-5xl">
                            <div className="hero-info-left text-left max-w-md">
                                <p className=" text-base md:text-lg leading-relaxed">
                                    El altiplano boliviano, cuna de culturas milenarias, resguarda en sus vientos y montañas la esencia de instrumentos que trascienden lo meramente musical.
                                </p>
                            </div>

                            <div className=" relative flex items-center justify-center overflow-hidden  w-[600px] h-[320px] shrink-0">
                                <img
                                    src="/img/charango.png"
                                    alt="Charango"
                                    className="w-full h-[200%] object-cover transform translate-y-40"
                                    style={{ filter: "drop-shadow(0 0 16px rgba(245,158,11,0.7))" }}
                                />
                            </div>

                            <div className="hero-info-right text-right max-w-md">
                                <p className=" text-base md:text-lg leading-relaxed">
                                    El charango, el ronroco y el walaycho son más que cuerdas y madera; son narradores de historias y símbolos de identidad.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <HorizontalSection />
            <FanSection />
        </main>
    );
}