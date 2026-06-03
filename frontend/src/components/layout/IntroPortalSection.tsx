"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Frecuencias para las cuerdas del charango (afinación estándar temple temple)
// El charango tiene 5 órdenes dobles. El tercer orden es octavado.
const STRING_COURSES = [
    { name: "G4", freq1: 392.00, label: "5to Orden (Sol)", color: "#f59e0b" },
    { name: "C5", freq1: 523.25, label: "4to Orden (Do)", color: "#d97706" },
    { name: "E5_E4", freq1: 659.25, freq2: 329.63, label: "3er Orden (Mi - Octavado)", color: "#fbbf24" },
    { name: "A4", freq1: 440.00, label: "2do Orden (La)", color: "#d97706" },
    { name: "E5", freq1: 659.25, label: "1er Orden (Mi)", color: "#f59e0b" }
];

let audioCtx: AudioContext | null = null;

interface IntroPortalSectionProps {
    onComplete?: () => void;
}

export default function IntroPortalSection({ onComplete }: IntroPortalSectionProps) {
    const portalRef = useRef<HTMLDivElement>(null);
    const charangoRef = useRef<SVGSVGElement>(null);
    const zoomGroupRef = useRef<SVGGElement>(null);
    const stringRefs = useRef<(SVGGElement | null)[]>([]);
    const [audioReady, setAudioReady] = useState(false);
    const lastPlucked = useRef<number[]>([0, 0, 0, 0, 0]);

    // Inicializar el Audio Context en el primer gesto de interacción del usuario
    const initAudio = () => {
        if (typeof window === "undefined") return;
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        if (!audioReady) {
            setAudioReady(true);
        }
    };

    // Sintetizar el sonido de un charango pulsado (Algoritmo físico simplificado de cuerda acústica)
    const playStringSound = (freq1: number, freq2?: number) => {
        initAudio();
        if (!audioCtx || audioCtx.state === "suspended") return;

        const now = audioCtx.currentTime;

        // Función interna para crear una pulsación de cuerda
        const createPluck = (frequency: number, volume: number) => {
            if (!audioCtx) return;
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();

            // Onda triangular para la calidez de la madera y las cuerdas de nylon/metal
            osc.type = "triangle";
            osc.frequency.setValueAtTime(frequency, now);

            // Filtro dinámico de paso bajo para dar el decaimiento brillante característico de la pulsación
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(4000, now);
            filter.frequency.exponentialRampToValueAtTime(150, now + 1.2); // El sonido se apaga y oscurece

            // Envolvente de Volumen ADSR
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + 0.006); // Ataque ultra-rápido de la púa
            gainNode.gain.exponentialRampToValueAtTime(volume * 0.3, now + 0.15); // Rápido decaimiento
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.4); // Sostenido y liberación larga

            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            osc.start(now);
            osc.stop(now + 1.5);

            // IMPORTANTE: Desconectar los nodos de audio al finalizar para evitar fugas de memoria y procesamiento.
            // Esto evita que cientos de nodos se queden colgados en el thread de audio, solucionando el lag por completo.
            osc.onended = () => {
                osc.disconnect();
                filter.disconnect();
                gainNode.disconnect();
            };
        };

        // Si es el tercer orden (Mi), es octavado, así que suena en dos frecuencias a la vez
        if (freq2) {
            createPluck(freq1, 0.15);
            createPluck(freq2, 0.18); // Frecuencia octavada con un poco más de cuerpo
        } else {
            createPluck(freq1, 0.22);
        }
    };

    // Vibración visual y sonora al pasar el cursor
    const handleStringHover = (index: number) => {
        const lineGroup = stringRefs.current[index];
        if (!lineGroup) return;

        // Evitar saturación y lag controlando la frecuencia de pulsación por cuerda (debounce de 80ms)
        const nowTime = Date.now();
        if (nowTime - lastPlucked.current[index] < 80) return;
        lastPlucked.current[index] = nowTime;

        // Trigger el sonido dulce de la cuerda
        const stringData = STRING_COURSES[index];
        playStringSound(stringData.freq1, stringData.freq2);

        // Animación GSAP de vibración rápida con decaimiento del grupo (ambas cuerdas vibran juntas)
        gsap.timeline()
            .to(lineGroup, { x: 3, duration: 0.04, yoyo: true, repeat: 4 })
            .to(lineGroup, { x: -2, duration: 0.05, yoyo: true, repeat: 3 })
            .to(lineGroup, { x: 1, duration: 0.06, yoyo: true, repeat: 2 })
            .to(lineGroup, { x: 0, duration: 0.1, ease: "power2.out" });
    };

    useEffect(() => {
        const portal = portalRef.current;
        const charango = charangoRef.current;
        const zoomGroup = zoomGroupRef.current;

        if (!portal || !charango || !zoomGroup) return;

        // Registrar gestos comunes del usuario para habilitar/desbloquear el sonido en todos los navegadores
        window.addEventListener("pointerdown", initAudio);
        window.addEventListener("click", initAudio);
        window.addEventListener("touchstart", initAudio);
        window.addEventListener("mousedown", initAudio);

        // GSAP Timeline controlado virtualmente para el ZOOM IN progresivo y cinematográfico
        const ctx = gsap.context(() => {
            let completed = false;
            const tl = gsap.timeline({ paused: true });

            // 1. Desvanecer textos flotantes con elevación
            tl.to(".intro-text-element", {
                opacity: 0,
                y: -30,
                duration: 0.35,
                ease: "power2.out"
            }, 0);

            // 2. ZOOM IN DEFINITIVO: Escalamos el contenedor SVG completo
            // La boca del charango está en cx=150, cy=245 (viewBox 300x500), equivalente a "50% 49%" en la escala HTML de la caja del SVG
            tl.fromTo(charango,
                { scale: 1.1, transformOrigin: "50% 49%" },
                {
                    scale: 180, // Escala ultra-masiva para adentrarse completamente dentro de la boca
                    transformOrigin: "50% 49%",
                    ease: "none", // Easing lineal para control proporcional del scroll
                    duration: 1
                },
                0
            );

            // 3. Desvanecer el fondo negro del portal para revelar la landing
            tl.to(".portal-bg-rect", {
                opacity: 0,
                ease: "power1.inInOut",
                duration: 0.85
            }, 0.15);

            // 4. Desvanecer la silueta de madera del charango al final para un fundido limpio
            tl.to(charango, {
                opacity: 0,
                ease: "power2.out",
                duration: 0.35
            }, 0.65);

            // Virtual Scroll Track & Smooth Tweening
            let virtualScrollY = 0;
            // totalScrollThreshold define la cantidad de "scroll" virtual necesaria para completar el zoom.
            // Reducido a 750px para una entrada ultra-rápida y súper directa (apenas un leve giro de rueda).
            const totalScrollThreshold = 750;
            const progressObj = { value: 0 };

            const updateVirtualScroll = (deltaY: number) => {
                if (completed) return;

                virtualScrollY += deltaY;
                virtualScrollY = Math.max(0, Math.min(totalScrollThreshold, virtualScrollY));

                const targetProgress = virtualScrollY / totalScrollThreshold;

                // Tween rápido y ultra-reactivo (0.45s de duración de amortiguación)
                gsap.to(progressObj, {
                    value: targetProgress,
                    duration: 0.45, 
                    ease: "power2.out",
                    overwrite: "auto",
                    onUpdate: () => {
                        tl.progress(progressObj.value);
                        if (progressObj.value >= 0.98 && !completed) {
                            completed = true;
                            if (onComplete) {
                                onComplete();
                            }
                        }
                    }
                });
            };

            const handleWheel = (e: WheelEvent) => {
                e.preventDefault();
                updateVirtualScroll(e.deltaY);
            };

            let touchStartY = 0;
            const handleTouchStart = (e: TouchEvent) => {
                touchStartY = e.touches[0].clientY;
            };

            const handleTouchMove = (e: TouchEvent) => {
                if (e.cancelable) {
                    e.preventDefault();
                }
                const currentY = e.touches[0].clientY;
                const deltaY = touchStartY - currentY;
                touchStartY = currentY;

                // Aumentamos ligeramente la sensibilidad táctil para que el arrastre en móviles sea intuitivo y fluido
                updateVirtualScroll(deltaY * 1.8);
            };

            const blockedKeys = [" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"];
            const handleKeyDown = (e: KeyboardEvent) => {
                if (blockedKeys.includes(e.key)) {
                    e.preventDefault();
                    if (e.key === "ArrowDown" || e.key === " ") {
                        updateVirtualScroll(120);
                    } else if (e.key === "ArrowUp") {
                        updateVirtualScroll(-120);
                    } else if (e.key === "PageDown") {
                        updateVirtualScroll(500);
                    } else if (e.key === "PageUp") {
                        updateVirtualScroll(-500);
                    }
                }
            };

            window.addEventListener("wheel", handleWheel, { passive: false });
            window.addEventListener("touchstart", handleTouchStart, { passive: true });
            window.addEventListener("touchmove", handleTouchMove, { passive: false });
            window.addEventListener("keydown", handleKeyDown, { passive: false });

            // El valor de retorno en el context de GSAP limpia los eventos automáticamente al desmontar
            return () => {
                window.removeEventListener("wheel", handleWheel);
                window.removeEventListener("touchstart", handleTouchStart);
                window.removeEventListener("touchmove", handleTouchMove);
                window.removeEventListener("keydown", handleKeyDown);
            };
        }, portal);

        return () => {
            window.removeEventListener("pointerdown", initAudio);
            window.removeEventListener("click", initAudio);
            window.removeEventListener("touchstart", initAudio);
            window.removeEventListener("mousedown", initAudio);
            ctx.revert();
        };
    }, [onComplete]);

    /**
     * ===================================================================================
     * INSTRUCCIONES PARA OTRAS IA - CÓMO MODIFICAR EL SVG DEL CHARANGO SIN ROMPER LA LÓGICA:
     * ===================================================================================
     * Si vas a reemplazar o mejorar el diseño de vectores del charango en el SVG de abajo,
     * debes cumplir estrictamente con las siguientes reglas para no romper las animaciones ni los sonidos:
     * 
     * 1. SISTEMA DE COORDENADAS Y VIEWBOX:
     *    - El SVG debe tener obligatoriamente viewBox="0 0 300 500". Toda la posición relativa
     *      de cuerdas, golpes, puente y zoom depende de este tamaño.
     * 
     * 2. LA BOCA DEL CHARANGO (PUNTO CRÍTICO DE ZOOM):
     *    - El centro de la boca del charango (soundhole) DEBE ESTAR EXACTAMENTE en cx="150" y cy="245".
     *    - El radio de la boca DEBE SER r="32" para alinearse con la máscara del portal.
     *    - Si alteras cx=150 o cy=245, la cámara de GSAP no entrará en el agujero y el zoom se descentrará.
     * 
     * 3. MÁSCARA DEL PORTAL (<mask id="portal-mask">):
     *    - Conserva siempre el <mask id="portal-mask"> con el círculo negro de r="32" en cx="150", cy="245".
     *      Esta máscara es la que hace la boca transparente para poder ver el fondo de la landing page.
     * 
     * 4. CUERDAS Y PUENTE (INTERACTIVIDAD WEB AUDIO):
     *    - El puente y cejuela de hueso están situados en y="374" (el anclaje de cuerdas).
     *    - Las cuerdas visuales e interactivas paralelas nacen en y="0" y descienden verticalmente hasta y="374".
     *    - Mantén las posiciones 'x' de las 5 órdenes en los mismos valores del mapa para que las
     *      zonas invisibles táctiles (<rect> de hover) sigan coincidiendo exactamente con las cuerdas.
     * ===================================================================================
     */

    return (
        <>
            <div
                ref={portalRef}
                className="fixed inset-0 flex flex-col items-center justify-center bg-transparent overflow-hidden z-50 select-none pointer-events-none"
            >
                {/* Iluminación mística de fondo inicial */}
                <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0%,transparent_75%)] pointer-events-none intro-text-element" />

                {/* Textos flotantes superiores */}
                <div className="absolute top-10 flex flex-col items-center text-center px-6 z-30 pointer-events-none intro-text-element transition-all">
                    <span className="text-[10px] font-sans tracking-[0.5em] text-amber-500 uppercase font-bold mb-3">
                        Artesena Boutique
                    </span>
                    <h1 className="font-serif text-3xl md:text-5xl font-semibold text-white tracking-wide">
                        El Portal del Charango
                    </h1>
                    <div className="w-16 h-[2px] bg-linear-to-r from-amber-500 to-transparent mt-4 mb-3" />
                    <p className="text-xs md:text-sm text-stone-400 font-sans tracking-wide">
                        Pasa tu cursor para rasguear las cuerdas de nylon e iniciar la melodía andina
                    </p>
                </div>

                {/* SVG del Charango Premium con Portal Lens (pointer-events-none para click-through, los niños interactivos activan pointer-events-auto) */}
                <svg
                    ref={charangoRef}
                    viewBox="0 0 300 500"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute inset-0 w-full h-full z-20 select-none pointer-events-none"
                    style={{
                        willChange: "transform",
                        transformStyle: "preserve-3d",
                        backfaceVisibility: "hidden",
                    }}
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        {/* Máscara del portal: el círculo central (boca) corta un agujero transparente */}
                        <mask id="portal-mask">
                            <rect x="-1000" y="-1000" width="3000" height="3000" fill="white" />
                            <circle cx="150" cy="245" r="32" fill="black" />
                        </mask>
                        
                        {/* Tapa de abeto (Spruce) clara alemana premium para la tapa armónica */}
                        <radialGradient id="spruce_wood" cx="50%" cy="40%" r="65%">
                            <stop offset="0%" stopColor="#fdfcf4" />
                            <stop offset="60%" stopColor="#fbf3cf" />
                            <stop offset="100%" stopColor="#f5e6a5" />
                        </radialGradient>

                        {/* Madera de Jacarandá/Palisandro veteada oscura para puente y golpeador */}
                        <linearGradient id="rosewood_wood" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3d1c0e" />
                            <stop offset="25%" stopColor="#220e06" />
                            <stop offset="50%" stopColor="#34160a" />
                            <stop offset="75%" stopColor="#1a0904" />
                            <stop offset="100%" stopColor="#0b0301" />
                        </linearGradient>

                        {/* Diapasón de Ébano con textura de grano oscuro */}
                        <linearGradient id="ebony_grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#1a1a1c" />
                            <stop offset="50%" stopColor="#2d2d30" />
                            <stop offset="100%" stopColor="#0d0d0f" />
                        </linearGradient>

                        {/* Incrustaciones de nácar/perla (Mother of Pearl) */}
                        <radialGradient id="pearl_grad" cx="30%" cy="30%" r="70%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="60%" stopColor="#e4e4e7" />
                            <stop offset="100%" stopColor="#a1a1aa" />
                        </radialGradient>
                    </defs>

                    {/* Elementos de zoom agrupados y controlados localmente en coordenadas del SVG */}
                    <g ref={zoomGroupRef}>
                        {/* Fondo oscuro del portal que cubre todo el viewport con un agujero en la boca */}
                        <rect 
                            x="-1000" 
                            y="-1000" 
                            width="3000" 
                            height="3000" 
                            fill="#0c0a09" 
                            mask="url(#portal-mask)" 
                            className="portal-bg-rect"
                        />

                        {/* Cuerpo del Charango y Mástil (Enmascarados para que la boca sea transparente al fondo) */}
                        <g mask="url(#portal-mask)">
                            {/* 1. Mástil y Diapasón que salen rectos por la parte superior (sin clavijero visible) */}
                            <rect x="135" y="0" width="30" height="200" fill="url(#rosewood_wood)" rx="2" />
                            <rect x="138" y="0" width="24" height="200" fill="url(#ebony_grad)" />
                            
                            {/* Trastes dorados de alpaca/latón */}
                            {[15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195].map((yVal, i) => (
                                <line key={i} x1="138" y1={yVal} x2="162" y2={yVal} stroke="#fbbf24" strokeWidth="0.8" opacity="0.65" />
                            ))}

                            {/* Puntos de nácar (Pearl Dots) en la escala tradicional (3, 5, 7, 9, 10, doble punto en el 12) */}
                            <circle cx="150" cy="37.5" r="1.8" fill="url(#pearl_grad)" />
                            <circle cx="150" cy="67.5" r="2.0" fill="url(#pearl_grad)" />
                            <circle cx="150" cy="97.5" r="2.0" fill="url(#pearl_grad)" />
                            <circle cx="150" cy="127.5" r="2.0" fill="url(#pearl_grad)" />
                            <circle cx="150" cy="142.5" r="2.0" fill="url(#pearl_grad)" />
                            <circle cx="146.5" cy="172.5" r="1.8" fill="url(#pearl_grad)" />
                            <circle cx="153.5" cy="172.5" r="1.8" fill="url(#pearl_grad)" />

                            {/* 3. Tapa Armónica - Silueta Sólida en 8 "Chato y Gordo" Auténtico del Charango (Forma de Pera / Flancos Anchos) */}
                            <path
                                d="M 135 170 C 112 170, 92 182, 92 210 C 92 225, 96 238, 98 250 C 98 270, 60 300, 60 355 C 60 415, 105 440, 150 440 C 195 440, 240 415, 240 355 C 240 300, 202 270, 202 250 C 202 238, 204 225, 208 210 C 208 182, 188 170, 165 170 Z"
                                fill="url(#spruce_wood)"
                                stroke="#1b0e07"
                                strokeWidth="3.5"
                            />
                            
                            {/* Fileteado Ornamental a Cuadros (Checkered Purfling) en la Tapa Armónica */}
                            <path
                                d="M 135 170 C 112 170, 92 182, 92 210 C 92 225, 96 238, 98 250 C 98 270, 60 300, 60 355 C 60 415, 105 440, 150 440 C 195 440, 240 415, 240 355 C 240 300, 202 270, 202 250 C 202 238, 204 225, 208 210 C 208 182, 188 170, 165 170 Z"
                                stroke="#fbf4cf"
                                strokeWidth="3.5"
                                fill="none"
                            />
                            <path
                                d="M 135 170 C 112 170, 92 182, 92 210 C 92 225, 96 238, 98 250 C 98 270, 60 300, 60 355 C 60 415, 105 440, 150 440 C 195 440, 240 415, 240 355 C 240 300, 202 270, 202 250 C 202 238, 204 225, 208 210 C 208 182, 188 170, 165 170 Z"
                                stroke="#1b0e07"
                                strokeWidth="3.5"
                                strokeDasharray="4,4"
                                fill="none"
                            />
                            {/* Fina línea dorada interior de acento de luthier */}
                            <path
                                d="M 136 173 C 114 173, 93 184, 93 210 C 93 224, 98 237, 101 248 C 101 268, 63 298, 63 355 C 63 411, 107 436, 150 436 C 193 436, 237 411, 237 355 C 237 298, 199 268, 199 248 C 199 237, 202 224, 207 210 C 207 184, 186 173, 164 173 Z"
                                stroke="#d97706"
                                strokeWidth="1.0"
                                fill="none"
                                opacity="0.65"
                            />

                            {/* Golpeadores (Pickguards) Simétricos de Madera de Jacarandá Cubriendo los Hombros y Enmarcando la Cintura con Lóbulos Redondeados */}
                            <path 
                                d="M 135 170 C 112 170, 92 182, 92 210 C 92 225, 96 238, 98 250 C 108 258, 120 258, 122 245 C 124 230, 128 200, 135 170 Z" 
                                fill="url(#rosewood_wood)" 
                                stroke="#d97706"
                                strokeWidth="0.6"
                                opacity="0.95"
                            />
                            <path 
                                d="M 165 170 C 188 170, 208 182, 208 210 C 208 225, 204 238, 202 250 C 192 258, 180 258, 178 245 C 176 230, 172 200, 165 170 Z" 
                                fill="url(#rosewood_wood)" 
                                stroke="#d97706"
                                strokeWidth="0.6"
                                opacity="0.95"
                            />

                            {/* 4. Puente Biselado de Jacarandá, cejuela de hueso y atador */}
                            <path
                                d="M 112 384
                                   L 117 374
                                   L 183 374
                                   L 188 384
                                   L 183 389
                                   L 117 389
                                   Z"
                                fill="url(#rosewood_wood)"
                                stroke="#100501"
                                strokeWidth="1.2"
                            />
                            {/* Cejuela de Hueso (Bone Saddle) */}
                            <rect x="125" y="376.5" width="50" height="2.5" fill="#fafaf4" rx="0.5" />
                            {/* Bloque Atador (Tie Block) */}
                            <rect x="135" y="380.5" width="30" height="6.5" fill="#140803" rx="0.5" stroke="#d97706" strokeWidth="0.5" />
                            {/* Nudos decorativos de cuerdas (String ties) */}
                            <g opacity="0.8">
                                {[137.5, 140.5, 143.5, 146.5, 149.5, 152.5, 155.5, 158.5, 161.5, 164.5].map((xVal, i) => (
                                    <circle key={i} cx={xVal} cy="384.2" r="0.75" fill="#fbbf24" />
                                ))}
                            </g>
                        </g>

                        {/* Roseta a cuadros y bordes de la boca */}
                        <circle cx="150" cy="245" r="32" stroke="#1b0e07" strokeWidth="2.5" />
                        {/* Anillo de roseta fileteada a cuadros */}
                        <circle cx="150" cy="245" r="35.5" stroke="#fbf4cf" strokeWidth="3" />
                        <circle cx="150" cy="245" r="35.5" stroke="#1b0e07" strokeWidth="3" strokeDasharray="3.5,3.5" />
                        <circle cx="150" cy="245" r="39.5" stroke="#1b0e07" strokeWidth="1.5" />
                        <circle cx="150" cy="245" r="42.5" stroke="#d97706" strokeWidth="1.0" opacity="0.65" />

                        {/* 6. 10 Cuerdas (5 Órdenes Dobles) cruzando la boca. Nacen desde y=0 */}
                        {[
                            { idx: 0, x1: 139.2, x2: 140.8 },
                            { idx: 1, x1: 144.2, x2: 145.8 },
                            { idx: 2, x1: 149.2, x2: 150.8 }, // Orden octavado central
                            { idx: 3, x1: 154.2, x2: 155.8 },
                            { idx: 4, x1: 159.2, x2: 160.8 }
                        ].map((s) => (
                            <g key={s.idx}>
                                {/* Cuerdas visibles vibrando juntas en su orden */}
                                <g ref={(el) => { stringRefs.current[s.idx] = el; }}>
                                    <line
                                        x1={s.x1}
                                        y1="0"
                                        x2={s.x1}
                                        y2="374"
                                        stroke={STRING_COURSES[s.idx].color}
                                        strokeWidth="0.8"
                                        className="pointer-events-none"
                                    />
                                    <line
                                        x1={s.x2}
                                        y1="0"
                                        x2={s.x2}
                                        y2="374"
                                        stroke={STRING_COURSES[s.idx].color}
                                        strokeWidth="0.8"
                                        className="pointer-events-none"
                                    />
                                </g>
                                
                                {/* Zona de interacción más ancha e invisible para el hover */}
                                <rect
                                    x={s.x1 - 4}
                                    y="200"
                                    width="12"
                                    height="180"
                                    fill="transparent"
                                    className="cursor-pointer pointer-events-auto"
                                    onMouseEnter={() => handleStringHover(s.idx)}
                                    onPointerEnter={() => handleStringHover(s.idx)}
                                    onPointerDown={() => handleStringHover(s.idx)}
                                    onMouseDown={() => handleStringHover(s.idx)}
                                />
                            </g>
                        ))}
                    </g>
                </svg>

                {/* Leyenda y flecha en la parte inferior */}
                <div className="absolute bottom-10 flex flex-col items-center z-30 animate-pulse pointer-events-none intro-text-element">
                    <span className="text-[9px] font-sans tracking-[0.4em] text-stone-500 uppercase font-bold mb-2">
                        Desliza hacia abajo
                    </span>
                    <svg className="w-5 h-5 text-amber-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </div>
        </>
    );
}

