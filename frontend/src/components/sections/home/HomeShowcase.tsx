"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

interface ScrollInteractiveShowcaseProps {
    imageSrc: string;
    imageAlt: string;
    title: string;
    description: string;
    badgeText: string;
    side?: "left" | "right";
    theme?: "dark" | "cream";
}

export default function HomeShowcase({
    imageSrc,
    imageAlt,
    title,
    description,
    badgeText,
    side = "left",
    theme = "cream",
}: ScrollInteractiveShowcaseProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const textElements = textRef.current?.children;
        if (textElements) {
            gsap.fromTo(
                textElements,
                { y: 30, opacity: 0 },
                {
                    y: 0, opacity: 1, stagger: 0.15, duration: 1.2, ease: "power3.out",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 75%",
                    }
                }
            );
        }
    }, []);

    return (
        <section
            ref={sectionRef}
            style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                minHeight: "90vh",
                background: "#FCFBF8",
                overflow: "hidden",
            }}
            className="zara-split-grid"
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
                
                .zara-split-grid {
                    grid-template-columns: 1fr 1fr !important;
                }
                
                @media (max-width: 900px) {
                    .zara-split-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .zara-split-img {
                        height: 50vh !important;
                    }
                }
            `}</style>
            
            {/* Text Side */}
            <div
                ref={textRef}
                style={{
                    padding: "clamp(40px, 8vw, 100px)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    order: side === "left" ? 1 : 2,
                    background: "#FCFBF8",
                }}
            >
                <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: "italic",
                    fontSize: "clamp(2rem, 3.5vw, 3.5rem)",
                    color: "#111",
                    lineHeight: 1.3,
                    margin: "0 0 32px",
                    fontWeight: 400,
                    letterSpacing: "0.02em"
                }}>
                    "{description}"
                </p>
                
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#111", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        — {title}
                    </span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 20, color: "#666" }}>
                        , {badgeText}
                    </span>
                </div>
            </div>

            {/* Image Side */}
            <div
                className="zara-split-img"
                style={{
                    position: "relative",
                    height: "100%",
                    width: "100%",
                    order: side === "left" ? 2 : 1,
                    background: "#e5e5e5"
                }}
            >
                <Image
                    src={imageSrc}
                    alt={imageAlt}
                    fill
                    style={{ objectFit: "cover", objectPosition: "center" }}
                />
            </div>
        </section>
    );
}
