import OptimizedVideo from "@/components/ui/OptimizedVideo";

interface FabFullSectionProps {
    srcMp4: string;
    overlayColor: string;
    title: string;
    desc: string;
    align?: "left" | "center" | "right";
}

export default function FabFullSection({ 
    srcMp4, 
    overlayColor, 
    title, 
    desc,
    align = "left" 
}: FabFullSectionProps) {
    return (
        <section className="fab-section">
            <div className="fab-video-layer">
                <div className="fab-video-half">
                    <OptimizedVideo 
                        srcMp4={srcMp4}
                        overlayColor={overlayColor}
                        className="w-full h-full"
                    />
                </div>
            </div>
            <div className={`fab-content-layer align-${align}`}>
                <h2 className="fab-title">{title}</h2>
                {/* transform: translateZ(0) forces a new composite layer to prevent Chrome mix-blend-mode bugs on siblings */}
                <p className="fab-desc" style={{ transform: "translateZ(0)" }}>{desc}</p>
            </div>
        </section>
    );
}
