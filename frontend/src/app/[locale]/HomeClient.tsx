"use client";

import { useEffect } from "react";
import HorizontalSection from "@/components/layout/HorizontalSection";
import FanSection from "@/components/layout/FanSection";
import { useVantaWaves } from "@/hooks/useVantaWaves";
import { useHeroAnimations } from "@/hooks/useHeroAnimations";
import Image from "next/image";
import ScrollInteractiveShowcase from "@/components/layout/ScrollInteractiveShowcase";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const titleLetters = "ARTESENA".split("");

export default function HomeClient() {
    const containerRef = useVantaWaves(0xf59e0b, true);
    useHeroAnimations(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        ScrollTrigger.refresh();
    }, []);

    return (
        <main className="font-['Cormorant_Garamond',serif]">
            <div className="relative w-full">
                {/* Hero */}
                <div ref={containerRef} className="relative w-screen h-screen overflow-hidden">
                    <div className="absolute inset-0 z-1 bg-linear-to-b from-black/10 to-black/10" />

                    <div className="absolute inset-0 z-10 w-screen flex items-center justify-center px-10 md:px-20 pointer-events-none">
                        <div className="font-aldrich   flex flex-col items-center text-center">
                            <h1 className="flex font-cormorant gap-0 md:gap-1" style={{ perspective: "600px" }}>
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
                            </h1>
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
                                    <Image
                                        src="/img/charango.png"
                                        alt="Charango"
                                        fill
                                        sizes="600px"
                                        priority
                                        className="hero-charango object-cover transform translate-y-40"
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

                <ScrollInteractiveShowcase
                    imageSrc="/img/art/art1.png"
                    imageAlt="Tallado de Madera de Luthería"
                    badgeText="Luthería Boliviana"
                    title="La Madera que Canta: Ébano y Naranjillo"
                    description="El secreto de un sonido dulce, resonante y profundo reside en la rigurosa selección de las maderas más finas de los Andes. Cada trozo es cortado bajo el ángulo de grano perfecto y curado naturalmente por años antes de ser esculpido por el luthier."
                    side="left"
                    theme="dark"
                />

                <HorizontalSection />

                <ScrollInteractiveShowcase
                    imageSrc="/img/charango.png"
                    imageAlt="Charango Artesanal Artesena"
                    badgeText="Selección Exclusiva"
                    title="La Armonía de Cuerdas de Acero y Nylon"
                    description="El charango boliviano tradicional posee un timbre inconfundible de diez cuerdas dispuestas en cinco órdenes dobles. En Artesena, calibramos cada instrumento con absoluta precisión para garantizar una afinación duradera y una resonancia armónica exquisita en cada rasgueo."
                    side="right"
                    theme="cream"
                />

                <FanSection />
            </div>
        </main>
    );
}
