import Image from "next/image";

interface MuseumImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    style?: React.CSSProperties;
}

export default function MuseumImage({
    src,
    alt,
    width = 400,
    height = 500,
    className = "",
    style,
}: MuseumImageProps) {
    return (
        <div
            className={`museum-frame ${className}`}
            style={{
                position: "relative",
                backgroundColor: "#fff",
                padding: "16px", // The "mat" (passepartout) of the frame
                boxShadow: "0 20px 40px rgba(0,0,0,0.15), 0 5px 15px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.05)",
                border: "12px solid #2a2a2a", // The dark wooden/metal frame
                borderRadius: "2px",
                overflow: "hidden",
                ...style,
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    boxShadow: "inset 0 2px 10px rgba(0,0,0,0.1)", // inner shadow on the image
                }}
            >
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                    }}
                />
            </div>
        </div>
    );
}
