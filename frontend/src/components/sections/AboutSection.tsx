
"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import AboutHero from "./about/AboutHero";
import AboutQuote from "./about/AboutQuote";
import AboutStory from "./about/AboutStory";
import AboutMission from "./about/AboutMission";
import AboutCraftsmen, { Craftsman } from "./about/AboutCraftsmen";

gsap.registerPlugin(ScrollTrigger);

export default function AboutSection() {
    const t = useTranslations("about");

    useEffect(() => {
        // Removed laggy scale scroll effect
    }, []);

    const craftsmenData: Craftsman[] = [
        { colorOverlay: "rgba(196, 97, 46, 0.6)", bgImg: "/img/art/rt2.jpg", name: t("craft1Name"), role: t("craft1Role"), geo: "circle" },
        { colorOverlay: "rgba(45, 53, 97, 0.6)", bgImg: "/img/art/ARTT1.jpg", name: t("craft2Name"), role: t("craft2Role"), geo: "square" },
        { colorOverlay: "rgba(139, 105, 20, 0.6)", bgImg: "/img/art/RT4.jpg", name: t("craft3Name"), role: t("craft3Role"), geo: "diamond" },
    ];

    const storyColumns = [
        { borderColor: "#C4612E", num: t("col1Num"), title: t("col1Title"), desc: t("col1Desc") },
        { borderColor: "#2D3561", num: t("col2Num"), title: t("col2Title"), desc: t("col2Desc") },
        { borderColor: "#8B6914", num: t("col3Num"), title: t("col3Title"), desc: t("col3Desc") },
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=Inter:wght@800&display=swap');
                .about-craft-img-hover { transition: transform 0.5s ease; }
                .about-craft-img-hover:hover { transform: scale(1.03); }
                .mix-blend-text { mix-blend-mode: difference; color: #fff; }
            `}</style>

            <AboutHero 
                eyebrow={t("heroEyebrow")}
                title={t("title")}
                description={t("description")}
                quoteHtml={t("quote")}
                quoteAuthor={t("quoteAuthor")}
                bgImageLeft="/img/art/ARTT1.jpg"
                bgImageRight="/img/art/rt2.jpg"
            />

            <AboutQuote 
                eyebrow={t("philEyebrow")}
                quote={t("philQuote")}
                description={t("philDesc")}
                yearsNum={t("yearsNum")}
                yearsLabel={t("yearsLabel")}
                bgImageLeft="/img/art/RT4.jpg"
                bgImageRight="/img/art/rt2.jpg"
            />

            <AboutStory 
                eyebrow={t("storyEyebrow")}
                titleStartHtml={t("storyTitle")}
                titleEm={t("storyTitleEm")}
                titleEnd={t("storyTitleEnd")}
                columns={storyColumns}
            />

            <AboutMission 
                bgImage="/img/art/ARTT1.jpg"
                missionNum={t("missionNum")}
                eyebrow={t("missionEyebrow")}
                titleStartHtml={t("missionTitle")}
                titleEm={t("missionTitleEm")}
                description={t("missionDesc")}
            />

            <AboutCraftsmen 
                eyebrow={t("craftsEyebrow")}
                titleStartHtml={t("craftsTitle")}
                titleEm={t("craftsTitleEm")}
                titleEnd={t("craftsTitleEnd")}
                craftsmen={craftsmenData}
            />
        </>
    );
}
