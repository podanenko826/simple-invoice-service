import { useState, useRef } from "react";
import { Upload, X, Image } from "lucide-react";
import { Button } from "./button";
import { toast } from "sonner";

interface LogoUploadProps {
    value?: string; // Base64 encoded image
    onChange: (logo: string | undefined) => void;
    className?: string;
}

export function LogoUpload({ value, onChange, className }: LogoUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        // Validate file size (max 2MB for logos)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Logo must be smaller than 2MB");
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            onChange(result);
            toast.success("Logo uploaded successfully");
        };
        reader.onerror = () => {
            toast.error("Failed to read image file");
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleRemoveLogo = () => {
        onChange(undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        toast.success("Logo removed");
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={className}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
            />

            {value ? (
                // Show uploaded logo
                <div className="relative group">
                    <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/50">
                        <div className="flex items-center justify-center">
                            <img
                                src={value}
                                alt="Company logo"
                                className="max-h-24 max-w-full object-contain"
                            />
                        </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleRemoveLogo}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                    <div className="mt-2 text-center">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClick}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Change Logo
                        </Button>
                    </div>
                </div>
            ) : (
                // Show upload area
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragging
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={handleClick}
                >
                    <div className="flex flex-col items-center gap-2">
                        <Image className="h-8 w-8 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">
                                Upload company logo
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Drag & drop or click to select
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                PNG, JPG, SVG up to 2MB
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
