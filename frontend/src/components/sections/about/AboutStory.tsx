
"use client";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ColumnItem {
    num: string;
    title: string;
    desc: string;
    borderColor: string;
}

interface Props {
    eyebrow: string;
    titleStartHtml: string;
    titleEm: string;
    titleEnd: string;
    columns: ColumnItem[];
}

export default function AboutStory({ eyebrow, titleStartHtml, titleEm, titleEnd, columns }: Props) {
    const columnsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.fromTo(".about-col", { y: 50, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.2, duration: 1, ease: "power2.out", scrollTrigger: { trigger: columnsRef.current, start: "top 78%" } });
    }, []);

    return (
        <section ref={columnsRef} style={{ background: "#fff", padding: "clamp(60px, 10vh, 120px) clamp(24px, 7vw, 100px)" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "0.5em", textTransform: "uppercase", color: "#999", marginBottom: "16px" }}>{eyebrow}</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.5rem, 5vw, 5rem)", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.05, margin: "0 0 60px", letterSpacing: "-0.02em" }}>
                    <span dangerouslySetInnerHTML={{ __html: titleStartHtml }} />
                    <em style={{ color: "#C4612E", fontWeight: 400 }}>{titleEm}</em>
                    {titleEnd}
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "40px" }}>
                    {columns.map((col) => (
                        <div key={col.num} className="about-col" style={{ borderTop: `3px solid ${col.borderColor}`, paddingTop: "28px" }}>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "10px", letterSpacing: "0.4em", color: col.borderColor, marginBottom: "16px", textTransform: "uppercase" }}>{col.num}</p>
                            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(1.6rem, 2.5vw, 2.4rem)", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.1, margin: "0 0 16px" }}>{col.title}</h3>
                            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(0.9rem, 1.2vw, 1rem)", color: "#666", lineHeight: 1.8, fontWeight: 300 }}>{col.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
