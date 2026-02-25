import { useState } from "react";
import { MessageSquare } from "lucide-react";
import SISLogo from "./SISLogo";
import FeedbackDialog from "./FeedbackDialog";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const location = useLocation();

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/80 backdrop-blur-md">
                <div className="container flex h-16 items-center justify-between">
                    <SISLogo />
                    <nav className="flex items-center gap-6">
                        {location.pathname === "/workspace" && (
                            <button
                                onClick={() => setFeedbackOpen(true)}
                                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <MessageSquare className="h-4 w-4" />
                                Feedback
                            </button>
                        )}
                        {(location.pathname === "/" ||
                            location.pathname === "/how-it-works") && (
                            <Link to="/login">
                                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
                                    Get Started
                                </button>
                            </Link>
                        )}
                    </nav>
                </div>
            </header>
            <FeedbackDialog
                open={feedbackOpen}
                onOpenChange={setFeedbackOpen}
            />
        </>
    );
};

export default Header;
