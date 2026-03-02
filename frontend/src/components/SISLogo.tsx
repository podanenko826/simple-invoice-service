import { Link } from "react-router-dom";

const SISLogo = ({
    showSubtitle = false,
    size = "default",
}: {
    showSubtitle?: boolean;
    size?: "small" | "default" | "large";
}) => {
    const iconSize = size === "large" ? 48 : size === "small" ? 28 : 36;
    const textSize =
        size === "large"
            ? "text-3xl"
            : size === "small"
              ? "text-lg"
              : "text-2xl";
    const subtitleSize =
        size === "large"
            ? "text-sm"
            : size === "small"
              ? "text-[11px]"
              : "text-xs";

    return (
        <Link to="/" aria-label="OneThing Invoice - Home">
            <div className="flex items-center gap-3">
                {/* Blue square icon */}
                <div
                    className="bg-primary rounded-md flex-shrink-0"
                    style={{
                        width: iconSize,
                        height: iconSize,
                    }}
                    aria-hidden="true"
                />
                <div className="flex flex-col leading-none">
                    <span
                        className={`font-semibold text-foreground ${textSize}`}
                    >
                        OneThing
                    </span>
                    {showSubtitle && (
                        <span
                            className={`text-muted-foreground/70 font-normal ${subtitleSize} mt-0.5`}
                        >
                            Invoice
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default SISLogo;
