import OptimizedVideo from "@/components/ui/OptimizedVideo";

interface FabSplitSectionProps {
    srcMp4Left: string;
    overlayColorLeft: string;
    srcMp4Right: string;
    overlayColorRight: string;
    title: string;
    desc: string;
    align?: "left" | "center" | "right";
}

export default function FabSplitSection({ 
    srcMp4Left, 
    overlayColorLeft,
    srcMp4Right,
    overlayColorRight,
    title, 
    desc,
    align = "right" 
}: FabSplitSectionProps) {
    return (
        <section className="fab-split">
            <div className="fab-video-layer">
                <div className="fab-video-half">
                    <OptimizedVideo 
                        srcMp4={srcMp4Left}
                        overlayColor={overlayColorLeft}
                        className="w-full h-full"
                    />
                </div>
                <div className="fab-video-half">
                    <OptimizedVideo 
                        srcMp4={srcMp4Right}
                        overlayColor={overlayColorRight}
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
