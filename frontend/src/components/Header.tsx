import SISLogo from "./SISLogo";

const Header = () => (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
            <SISLogo />
            <nav className="flex items-center gap-6">
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Features
                </span>
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Pricing
                </span>
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                    Get Started
                </button>
            </nav>
        </div>
    </header>
);

export default Header;
