import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="border-t border-border bg-background">
            <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 py-5 px-6">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-bold text-foreground tracking-[0.15em] text-sm">
                        OneThing
                    </span>
                    <span className="text-border">|</span>
                    <span>© 2025 Simple Invoice Service</span>
                    <span className="text-border hidden sm:inline">|</span>
                    <span className="flex items-center gap-1.5">
                        Made in <span className="text-base">🇺🇦</span>
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
        </footer>
    );
};

export default Footer;
