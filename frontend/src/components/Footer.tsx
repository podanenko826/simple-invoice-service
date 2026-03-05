import { Link } from "react-router-dom";

const Footer = () => {
    const version = "0.9.0";

    return (
        <footer className="border-t border-border bg-background">
            <div className="container py-5 px-6">
                {/* Mobile Layout */}
                <div className="flex flex-col items-center gap-3 sm:hidden">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
                        <span className="font-bold text-foreground tracking-[0.15em] text-sm">
                            OneThing
                        </span>
                        <span className="text-muted-foreground/70">
                            Invoice Tool
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                        <span>© 2026 OneThing</span>
                        <span className="text-border/70">|</span>
                        <span className="flex items-center gap-1.5 whitespace-nowrap">
                            Made in <span className="text-base">🇺🇦</span>
                        </span>
                        <span className="text-border/70">|</span>
                        <span>v{version}</span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                        <Link
                            to="/about"
                            className="hover:text-foreground transition-colors"
                        >
                            About
                        </Link>
                        <Link
                            to="/privacy"
                            className="hover:text-foreground transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            to="/terms"
                            className="hover:text-foreground transition-colors"
                        >
                            Terms
                        </Link>
                    </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="font-bold text-foreground tracking-[0.15em] text-sm">
                            OneThing
                        </span>
                        <span className="text-muted-foreground/70">
                            Invoice Tool
                        </span>
                        <span className="text-border/70">|</span>
                        <span className="text-muted-foreground/70">
                            © 2026 OneThing
                        </span>
                        <span className="text-border/70">|</span>
                        <span className="flex items-center gap-1.5 text-muted-foreground/70">
                            Made in <span className="text-base">🇺🇦</span>
                        </span>
                        <span className="text-border/70">|</span>
                        <span className="text-muted-foreground/70">
                            v{version}
                        </span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                        <Link
                            to="/about"
                            className="hover:text-foreground transition-colors"
                        >
                            About
                        </Link>
                        <Link
                            to="/privacy"
                            className="hover:text-foreground transition-colors"
                        >
                            Privacy
                        </Link>
                        <Link
                            to="/terms"
                            className="hover:text-foreground transition-colors"
                        >
                            Terms
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
