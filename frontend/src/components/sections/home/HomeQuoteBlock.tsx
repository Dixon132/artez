
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

interface Props {
    image: string;
    quoteHtml: string;
    author: string;
    side?: "left" | "right";
}

export default function HomeQuoteBlock({ image, quoteHtml, author, side = "left" }: Props) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const imgRef = useRef<HTMLDivElement>(null);
    const authorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (sectionRef.current && textRef.current && imgRef.current && authorRef.current) {
            gsap.fromTo(
                imgRef.current,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out", scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } }
            );
            gsap.fromTo(
                textRef.current,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 1.5, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 60%" } }
            );
            gsap.fromTo(
                authorRef.current,
                { opacity: 0, x: side === "left" ? -30 : 30 },
                { opacity: 1, x: 0, duration: 1.5, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 60%" } }
            );
        }
    }, [side]);

    const isLeft = side === "left";

    return (
        <div ref={sectionRef} style={{
            position: "relative",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 0",
            overflow: "hidden"
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Inter:wght@700;800&display=swap');
                
                .quote-overlap-text {
                    font-family: 'Inter', sans-serif;
                    font-size: clamp(3rem, 7vw, 9rem);
                    font-weight: 800;
                    line-height: 0.9;
                    letter-spacing: -0.04em;
                    color: #fff;
                    mix-blend-mode: difference;
                    margin: 0;
                }
                
                @media (max-width: 768px) {
                    .quote-overlap-text {
                        font-size: clamp(2.5rem, 8vw, 4rem);
                        width: 90%;
                    }
                }
            `}</style>

            {/* Pure Image without adornments (pushed to the opposite side) */}
            <div style={{
                position: "absolute",
                top: "50%",
                [isLeft ? "right" : "left"]: "0%",
                transform: "translateY(-50%)",
                width: "55%",
                display: "flex",
                justifyContent: isLeft ? "flex-end" : "flex-start",
                pointerEvents: "none",
                zIndex: 1
            }}>
                <div ref={imgRef} style={{
                    position: "relative",
                    width: "clamp(300px, 45vw, 700px)", // Large image
                    height: "clamp(400px, 70vh, 900px)",
                }}>
                    <Image
                        src={image}
                        alt={author}
                        fill
                        style={{ objectFit: "contain" }}
                    />
                </div>
            </div>

            {/* Text and Author Wrapper */}
            <div style={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                [isLeft ? "left" : "right"]: "5%",
                width: "65%",
                zIndex: 10,
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: isLeft ? "flex-start" : "flex-end",
                gap: "24px" // Natural spacing to prevent overlap
            }}>
                <h2 
                    ref={textRef} 
                    className="quote-overlap-text" 
                    style={{
                        position: "relative",
                        top: "auto",
                        transform: "none",
                        width: "100%",
                        textAlign: isLeft ? "left" : "right"
                    }}
                    dangerouslySetInnerHTML={{ __html: quoteHtml }} 
                />

                <div ref={authorRef} style={{
                    fontFamily: "'Great Vibes', cursive",
                    fontSize: "clamp(3rem, 6vw, 5rem)",
                    color: "#fff",
                    textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                    transform: isLeft ? "rotate(-4deg)" : "rotate(4deg)",
                    marginTop: "10px"
                }}>
                    {author}
                </div>
            </div>
        </div>
    );
}
