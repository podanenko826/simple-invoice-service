const SISLogoIcon = ({
    size = 40,
    className = "",
}: {
    size?: number;
    className?: string;
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label="OneThing Invoice logo"
    >
        <defs>
            <linearGradient
                id="sis-grad-1"
                x1="0"
                y1="0"
                x2="64"
                y2="64"
                gradientUnits="userSpaceOnUse"
            >
                <stop offset="0%" stopColor="#1578C7" />
                <stop offset="100%" stopColor="#2BA89D" />
            </linearGradient>
            <linearGradient
                id="sis-grad-2"
                x1="64"
                y1="0"
                x2="0"
                y2="64"
                gradientUnits="userSpaceOnUse"
            >
                <stop offset="0%" stopColor="#2BA89D" />
                <stop offset="100%" stopColor="#1578C7" />
            </linearGradient>
        </defs>
        {/* Back shape – rounded rectangle tilted */}
        <rect
            x="10"
            y="8"
            width="36"
            height="48"
            rx="8"
            fill="url(#sis-grad-1)"
            opacity="0.35"
            transform="rotate(-6 28 32)"
        />
        {/* Front shape – rounded rectangle */}
        <rect
            x="18"
            y="8"
            width="36"
            height="48"
            rx="8"
            fill="url(#sis-grad-2)"
            opacity="0.85"
            transform="rotate(4 36 32)"
        />
        {/* S accent path */}
        <path
            d="M30 22C30 22 38 20 40 26C42 32 28 30 28 36C28 42 38 42 38 42"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
        />
    </svg>
);

export default SISLogoIcon;
