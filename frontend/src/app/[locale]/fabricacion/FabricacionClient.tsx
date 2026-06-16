"use client";

import { useTranslations } from "next-intl";
import FabFullSection from "@/components/sections/fabricacion/FabFullSection";
import FabSplitSection from "@/components/sections/fabricacion/FabSplitSection";

export default function FabricacionClient() {
    const t = useTranslations("fabricacion");

    return (
        <main className="bg-[#111] text-white">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800&family=Great+Vibes&display=swap');
                
                /* Using CSS Grid for perfect overlapping without stacking context isolation, 
                   which is required for mix-blend-mode to work over the videos */
                .fab-section, .fab-split {
                    display: grid;
                    grid-template-areas: "stack";
                    min-height: 100vh;
                    width: 100%;
                    overflow: hidden;
                    background: #000;
                }

                .fab-video-layer {
                    grid-area: stack;
                    width: 100%;
                    height: 100%;
                    display: flex;
                }

                .fab-video-half {
                    flex: 1;
                    position: relative;
                }

                .fab-content-layer {
                    grid-area: stack;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 0 8vw;
                    pointer-events: none;
                }

                .fab-content-layer.align-left {
                    align-items: flex-start;
                    text-align: left;
                }

                .fab-content-layer.align-right {
                    align-items: flex-end;
                    text-align: right;
                }

                .fab-content-layer.align-center {
                    align-items: center;
                    text-align: center;
                }

                .fab-title {
                    font-family: 'Inter', sans-serif;
                    font-size: clamp(2.5rem, 8vw, 7.5rem);
                    font-weight: 800;
                    line-height: 0.85;
                    letter-spacing: -0.04em;
                    color: #fff;
                    mix-blend-mode: difference;
                    margin: 0 0 15px 0;
                    text-transform: uppercase;
                    /* Will blend beautifully with the videos */
                }

                .fab-desc {
                    font-family: 'Cormorant Garamond', serif;
                    font-style: italic;
                    font-size: clamp(1.6rem, 3vw, 2.8rem);
                    color: #ffffff;
                    max-width: 700px;
                    line-height: 1.5;
                    font-weight: 400;
                    letter-spacing: 0.01em;
                    mix-blend-mode: difference;
                }

                @media (max-width: 768px) {
                    .fab-video-layer {
                        flex-direction: column;
                    }
                    .fab-content-layer {
                        padding: 0 5vw;
                    }
                    .fab-title {
                        font-size: clamp(2.2rem, 10vw, 4.5rem);
                    }
                    .fab-desc {
                        font-size: clamp(20px, 6vw, 28px);
                    }
                    /* On mobile, center everything for better readability */
                    .fab-content-layer.align-left, 
                    .fab-content-layer.align-right {
                        align-items: center;
                        text-align: center;
                    }
                }
            `}</style>

            <FabFullSection 
                srcMp4="/video/secado.mp4"
                overlayColor="rgba(165, 0, 0, 0.1)"
                title={t("section1Title")}
                desc={t("section1Desc")}
                align="left"
            />

            <FabSplitSection 
                srcMp4Left="/video/tallado.mp4"
                overlayColorLeft="rgba(45, 53, 97, 0.2)"
                srcMp4Right="/video/talladoPro.mp4"
                overlayColorRight="rgba(196, 97, 46, 0.2)"
                title={t("section2Title")}
                desc={t("section2Desc")}
                align="right"
            />

            <FabFullSection 
                srcMp4="/video/tapa.mp4"
                overlayColor="rgba(0, 0, 0, 0.2)"
                title={t("section3Title")}
                desc={t("section3Desc")}
                align="left"
            />

            <FabSplitSection 
                srcMp4Left="/video/boca.mp4"
                overlayColorLeft="rgba(139, 105, 20, 0.2)"
                srcMp4Right="/video/diapason.mp4"
                overlayColorRight="rgba(0, 0, 0, 0.2)"
                title={t("section4Title")}
                desc={t("section4Desc")}
                align="right"
            />

            <FabFullSection 
                srcMp4="/video/afinado.mp4"
                overlayColor="rgba(0, 0, 0, 0.2)"
                title={t("section5Title")}
                desc={t("section5Desc")}
                align="center"
            />
        </main>
    );
}
