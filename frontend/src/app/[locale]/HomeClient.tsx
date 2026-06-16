
"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";

import HomeHero from "@/components/sections/home/HomeHero";
import HomeEditorial from "@/components/sections/home/HomeEditorial";
import HomeCTA from "@/components/sections/home/HomeCTA";

import HomeShowcase from "@/components/sections/home/HomeShowcase";
import HomeWoodPhilosophy from "@/components/sections/home/HomeWoodPhilosophy";
import HomeArtisanPride from "@/components/sections/home/HomeArtisanPride";
import HomeQuotesWrapper from "@/components/sections/home/HomeQuotesWrapper";
import HomeQuoteBlock from "@/components/sections/home/HomeQuoteBlock";

gsap.registerPlugin(ScrollTrigger);

export default function HomeClient() {
    const t = useTranslations("home");

    useEffect(() => {
        window.scrollTo(0, 0);
        ScrollTrigger.refresh();

        // Section shrinking effect when leaving the viewport
        
    }, []);

    return (
        <main style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
            `}</style>

            <section className="home-section">
                <HomeHero />
            </section>

            <HomeEditorial 
                bgVideo="/video/tallado.mp4"
                overlayLeft="rgba(0, 0, 0, 0.6)"
                overlayRight="rgba(0, 0, 0, 0.3)"
            />

            <section className="home-section">
                <HomeShowcase
                    imageSrc="/img/art/art1.png"
                    imageAlt="Tallado de Madera de Luthería"
                    badgeText={t("showcase1Badge")}
                    title={t("showcase1Title")}
                    description={t("showcase1Desc")}
                    side="left"
                    theme="dark"
                />
            </section>

            <section className="home-section">
                <HomeWoodPhilosophy />
            </section>

            <section className="home-section">
                <HomeShowcase
                    imageSrc="/img/art/RT4.jpg"
                    imageAlt="Charango Artesanal Artesena"
                    badgeText={t("showcase2Badge")}
                    title={t("showcase2Title")}
                    description={t("showcase2Desc")}
                    side="right"
                    theme="cream"
                />
            </section>

            <section className="home-section">
                <HomeArtisanPride />
            </section>

            
            <HomeQuotesWrapper vantaBgColor={0x000000}>
                <HomeQuoteBlock 
                    image="/img/people/Gustavo-Santaolalla.png"
                    quoteHtml="Hay algo en el ronroco<br/>que tiene que ver<br/>con el silencio..."
                    author="Gustavo Santaolalla"
                    side="left"
                />
                <HomeQuoteBlock 
                    image="/img/people/ernestoo.png"
                    quoteHtml="El charango es un<br/>quirquincho que ha<br/>aprendido a cantar."
                    author="Ernesto Cavour"
                    side="right"
                />
                <HomeQuoteBlock 
                    image="/img/people/vadikk.png"
                    quoteHtml="La música es un<br/>arte colectivo."
                    author="Vadik Barron"
                    side="left"
                />
            </HomeQuotesWrapper>


            <HomeCTA />

        </main>
    );
}
