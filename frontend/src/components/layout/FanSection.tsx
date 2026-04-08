"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const slides = [
    {
        bg: "#1a0a00",
        label: "01",
        title: "Madera Seleccionada",
        text: "Cada pieza de madera es elegida a mano entre cientos por su resonancia y veta única.",
        accent: "#f59e0b",
    },
    {
        bg: "#0f172a",
        label: "02",
        title: "Talla Artesanal",
        text: "El proceso de talla puede tomar semanas, siguiendo técnicas transmitidas por generaciones.",
        accent: "#fbbf24",
    },
    {
        bg: "#1c1917",
        label: "03",
        title: "Afinación Maestra",
        text: "Cada instrumento es afinado y probado antes de salir de nuestro taller en Bolivia.",
        accent: "#fde68a",
    },
];

// genera puntos en arco para el clip-path tipo abanico
// el abanico se abre desde la esquina inferior izquierda
function fanClip(progress: number): string {
    if (progress <= 0) return "polygon(0% 100%, 0% 100%, 0% 100%)";
    if (progress >= 1) return "polygon(0% 100%, 200% -100%, -100% -100%)"; // cubre todo

    const cx = 0;   // origen X (esquina inferior izquierda) en %
    const cy = 100; // origen Y en %
    const radius = 220; // radio grande para cubrir toda la pantalla

    // el abanico barre de -90° (arriba) a 0° (derecha) según progress
    // ángulo inicial: apuntando hacia arriba-derecha (-80deg)
    // ángulo final: cubre toda la pantalla (90deg)
    const startAngle = -100; // grados
    const endAngle = 20;
    const currentAngle = startAngle + (endAngle - startAngle) * progress;

    // generamos puntos del arco
    const points: string[] = [];
    points.push(`${cx}% ${cy}%`); // origen

    const steps = 20;
    for (let i = 0; i <= steps; i++) {
        const angle = ((startAngle + (currentAngle - startAngle) * (i / steps)) * Math.PI) / 180;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        points.push(`${x}% ${y}%`);
    }

    points.push(`${cx}% ${cy}%`); // cerrar
    return `polygon(${points.join(", ")})`;
}

export default function FanSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const slidesRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const total = slides.length;
        const totalScroll = window.innerHeight * (total - 1);

        // slide 0 siempre visible completo (es el fondo)
        // slides 1, 2... empiezan cerrados
        slidesRef.current.forEach((el, i) => {
            if (!el) return;
            if (i === 0) {
                gsap.set(el, { clipPath: "none", zIndex: 1 });
            } else {
                gsap.set(el, { clipPath: fanClip(0), zIndex: i + 1 });
            }
        });

        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: section,
                start: "top top",
                end: `+=${totalScroll}`,
                pin: true,
                scrub: 0.6,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    const p = self.progress * (total - 1);

                    for (let i = 1; i < total; i++) {
                        const el = slidesRef.current[i];
                        if (!el) continue;
                        const local = Math.max(0, Math.min(1, p - (i - 1)));
                        // cuando está completo quitamos clip-path para evitar artefactos
                        if (local >= 1) {
                            gsap.set(el, { clipPath: "none" });
                        } else {
                            gsap.set(el, { clipPath: fanClip(local) });
                        }
                    }
                },
            });
        }, section);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={sectionRef} style={{ height: "100vh", position: "relative", overflow: "hidden" }}>
            {slides.map((s, i) => (
                <div
                    key={i}
                    ref={(el) => { slidesRef.current[i] = el; }}
                    style={{
                        position: "absolute",
                        inset: 0,
                        background: s.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: i + 1,
                    }}
                >
                    <div style={{ textAlign: "center", maxWidth: "640px", padding: "0 60px" }}>
                        <p style={{
                            fontSize: "11px", letterSpacing: "0.4em", textTransform: "uppercase",
                            color: s.accent, marginBottom: "20px", opacity: 0.7,
                        }}>
                            {s.label} / 0{slides.length}
                        </p>
                        <h2 style={{
                            fontSize: "72px", fontWeight: 700, color: "#fef3c7",
                            fontFamily: "'Cormorant Garamond', serif", lineHeight: 1.1, marginBottom: "24px",
                        }}>
                            {s.title}
                        </h2>
                        <div style={{
                            width: "60px", height: "2px",
                            background: `linear-gradient(to right, ${s.accent}, transparent)`,
                            margin: "0 auto 24px",
                        }} />
                        <p style={{ fontSize: "17px", color: "rgba(254,243,199,0.65)", lineHeight: 1.8 }}>
                            {s.text}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
