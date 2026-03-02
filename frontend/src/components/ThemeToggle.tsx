import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

interface ThemeToggleProps {
    showText?: boolean;
}

export function ThemeToggle({ showText = false }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            variant="ghost"
            size={showText ? "sm" : "icon"}
            className={
                showText
                    ? "gap-2 w-full justify-start text-muted-foreground"
                    : "text-muted-foreground"
            }
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            {showText && (
                <span className="text-sm font-medium">Toggle theme</span>
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
