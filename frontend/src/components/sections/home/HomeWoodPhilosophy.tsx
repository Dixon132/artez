"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import FloatingOrb from "@/components/ui/FloatingOrb";
import { useTranslations } from "next-intl";

gsap.registerPlugin(ScrollTrigger);

export default function HomeWoodPhilosophy() {
    const t = useTranslations("home");
    const sectionRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (textRef.current && sectionRef.current && imageContainerRef.current) {
            // Text entrance
            gsap.fromTo(
                textRef.current,
                { y: 50, opacity: 0, scale: 0.95 },
                {
                    y: 0, opacity: 1, scale: 1, duration: 1.5, ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 70%",
                    }
                }
            );

            // Image parallax and scale effect
            gsap.fromTo(
                imageContainerRef.current,
                { scale: 0.85, filter: "brightness(0.5)" },
                {
                    scale: 1, filter: "brightness(1)", duration: 2, ease: "power2.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                        scrub: 0.5
                    }
                }
            );
        }
    }, []);

    return (
        <section
            ref={sectionRef}
            className="philosophy-block"
            style={{
                position: "relative",
                minHeight: "100vh",
                background: "#0a0a0a", // Dark background to make mix-blend pop more
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                padding: "80px 0"
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800&family=DM+Sans:wght@400&display=swap');
                
                .zara-overlap-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100%;
                    text-align: center;
                    font-family: 'Inter', sans-serif;
                    font-size: clamp(3.5rem, 10vw, 12rem);
                    font-weight: 800;
                    line-height: 0.85;
                    letter-spacing: -0.04em;
                    color: #fff;
                    mix-blend-mode: difference;
                    z-index: 10;
                    pointer-events: none;
                    margin: 0;
                }
                
                @media (max-width: 768px) {
                    .zara-overlap-text {
                        font-size: clamp(3rem, 12vw, 5rem);
                        line-height: 0.95;
                    }
                }

                .wood-geo-lines {
                    position: absolute;
                    inset: 5%;
                    border: 1px solid rgba(255,255,255,0.05);
                    pointer-events: none;
                }
                .wood-geo-lines::before {
                    content: ''; position: absolute; inset: 20px; border: 1px solid rgba(255,255,255,0.03);
                }
            `}</style>

            <div className="wood-geo-lines" />

            {/* Floating Orbs for extra visual magic */}
            <FloatingOrb size="300px" color1="#C4612E" color2="#7c2d12" top="-10%" left="-10%" delay={0} />
            <FloatingOrb size="150px" color1="#8B6914" color2="#422006" bottom="10%" right="5%" delay={1} />

            {/* Centered Image with Parallax */}
            <div ref={imageContainerRef} style={{
                position: "relative",
                width: "clamp(280px, 35vw, 450px)",
                aspectRatio: "3/4",
                background: "#f0f0f0",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}>
                <Image
                    src="/img/art/art1.png"
                    alt="Luthier process"
                    fill
                    style={{ objectFit: "cover" }}
                />
                {/* Subtle warm overlay */}
                <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(196, 97, 46, 0.15)" }} />
            </div>

            {/* Overlapping Text */}
            <h2 ref={textRef} className="zara-overlap-text" dangerouslySetInnerHTML={{ __html: t("woodTitle") }} />
            
            {/* Small floating info */}
            <div style={{
                position: "absolute",
                bottom: "40px",
                right: "40px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)"
            }}>
                {t("woodSubtitle")}
            </div>
        </section>
    );
}
