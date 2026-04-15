"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useHeroAnimations() {
    useEffect(() => {
        const tl = gsap.timeline({ delay: 0.3 });
        
        tl.fromTo(".hero-letter",
            { y: 140, opacity: 0, rotateX: -90 },
            { y: 0, opacity: 1, rotateX: 0, duration: 1, ease: "power4.out", stagger: 0.06 }
        )
        .fromTo(".hero-sub",
            { opacity: 0, letterSpacing: "0.6em" },
            { opacity: 1, letterSpacing: "0.25em", duration: 1.2, ease: "power3.out" },
            "-=0.6"
        )
        .fromTo(".hero-desc",
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 1, ease: "power3.out" },
            "-=0.6"
        )
        .fromTo(".hero-info-left",
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
            "-=0.4"
        )
        .fromTo(".hero-info-right",
            { opacity: 0, x: 30 },
            { opacity: 1, x: 0, duration: 0.8, ease: "power3.out" },
            "<"
        )
        .fromTo(".hero-charango",
            { opacity: 0, y: 20, scale: 0.8 },
            { opacity: 1, y: 0, scale: 1, duration: 1, ease: "elastic.out(1, 0.6)" },
            "<"
        );

        gsap.to(".hero-charango", {
            y: -10,
            rotation: 3,
            duration: 2.5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 2,
        });

        return () => {
            tl.kill();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);
}
