
"use client";

import { useVantaBirds } from "@/hooks/useVantaBirds";

interface Props {
    children: React.ReactNode;
    vantaBgColor?: number;
    vantaColor1?: number;
    vantaColor2?: number;
}

export default function HomeQuotesWrapper({
    children,
    vantaBgColor = 0x000000,
    vantaColor1 = 0xc4612e,
    vantaColor2 = 0x8b6914
}: Props) {
    const vantaRef = useVantaBirds(vantaBgColor, vantaColor1, vantaColor2, true);

    return (
        <section style={{ position: "relative", background: "#000", width: "100%", overflow: "hidden" }}>
    <div ref={vantaRef as any} style={{ position: "absolute", inset: 0, zIndex: 0 }} />
            <div style={{ position: "relative", zIndex: 1 }}>
                {children}
            </div>
        </section>
    );
}
