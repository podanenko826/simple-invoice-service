import SISLogoIcon from "./SISLogoIcon";

const SISLogo = ({
    showSubtitle = false,
    size = "default",
}: {
    showSubtitle?: boolean;
    size?: "small" | "default" | "large";
}) => {
    const iconSize = size === "large" ? 48 : size === "small" ? 28 : 36;
    const textClass =
        size === "large"
            ? "text-3xl tracking-[0.25em]"
            : size === "small"
              ? "text-lg tracking-[0.2em]"
              : "text-2xl tracking-[0.22em]";

    return (
        <div className="flex items-center gap-2.5">
            <SISLogoIcon size={iconSize} />
            <div className="flex flex-col">
                <span className={`font-bold text-navy ${textClass}`}>SIS</span>
                {showSubtitle && (
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-medium -mt-0.5">
                        Simple Invoice Service
                    </span>
                )}
            </div>
        </div>
    );
};

export default SISLogo;
