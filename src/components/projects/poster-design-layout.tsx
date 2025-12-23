"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, ShoppingBag, Eye, EyeOff, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PosterDesignLayoutProps {
    project: {
        title: string;
        description?: string;
        // Project defaults (optional fallback)
        price?: string | null;
        shop_url?: string | null;
        background_color?: string | null;
        text_color?: string | null;
    };
    media: Array<{
        id: string;
        url: string;
        media_type: string;
        display_order: number;
        title?: string | null;
        price?: string | null;
        shop_url?: string | null;
    }>;
}

export default function PosterDesignLayout({ project, media }: PosterDesignLayoutProps) {
    // Config state
    const [gridColumns, setGridColumns] = useState(4); // Default 4 columns
    const [showNames, setShowNames] = useState(false);
    const [showPrices, setShowPrices] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    // Filter valid media
    const posters = useMemo(() => media.filter(m => m.url).sort((a, b) => a.display_order - b.display_order), [media]);

    const textColor = project.text_color || "#000";
    const bgColor = project.background_color || "#fff";

    // Lightbox Navigation
    const handlePrev = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
    }, []);

    const handleNext = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setSelectedIndex(prev => (prev !== null && prev < posters.length - 1 ? prev + 1 : prev));
    }, [posters.length]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null) return;
            if (e.key === "ArrowLeft") {
                setSelectedIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev));
            } else if (e.key === "ArrowRight") {
                setSelectedIndex(prev => (prev !== null && prev < posters.length - 1 ? prev + 1 : prev));
            } else if (e.key === "Escape") {
                setSelectedIndex(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedIndex, posters.length]);

    // Selected Item Data
    const selectedItem = selectedIndex !== null ? posters[selectedIndex] : null;

    // Helper to get effective price/link for an item
    const getItemPrice = (item: typeof posters[0]) => item.price || project.price;
    const getItemShopUrl = (item: typeof posters[0]) => item.shop_url || project.shop_url;

    return (
        <div
            className="min-h-screen w-full relative"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            {/* Footer Controls (Fixed Bottom) - Z-INDEX 40 to be above grid but below lightbox */}
            <div className="fixed bottom-0 left-0 right-0 z-40 flex items-end justify-between px-4 pb-4 md:px-6 md:pb-6 pointer-events-none mix-blend-difference text-white">

                {/* Bottom Left: Title */}
                <div className="pointer-events-auto">
                    <h1 className="text-xl md:text-2xl font-bold uppercase tracking-widest leading-none drop-shadow-sm select-none">
                        {project.title}
                    </h1>
                </div>

                {/* Bottom Right: Tools */}
                <div className="pointer-events-auto flex items-center gap-4 bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-lg">
                    {/* Grid Size */}
                    <div className="flex items-center gap-2 px-2 border-r border-white/20 pr-4">
                        <Minus className="w-4 h-4 cursor-pointer hover:scale-110 active:scale-90 transition-transform" onClick={() => setGridColumns(c => Math.max(1, c - 1))} />
                        <span className="text-xs font-mono min-w-[3ch] text-center select-none">x{gridColumns}</span>
                        <Plus className="w-4 h-4 cursor-pointer hover:scale-110 active:scale-90 transition-transform" onClick={() => setGridColumns(c => Math.min(10, c + 1))} />
                    </div>

                    {/* Toggles */}
                    <button
                        onClick={() => setShowNames(!showNames)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase transition-all select-none border ${showNames
                            ? "bg-white text-black border-white"
                            : "bg-transparent text-white/70 border-white/20 hover:border-white/50"
                            }`}
                    >
                        {showNames ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">Names</span>
                    </button>

                    <button
                        onClick={() => setShowPrices(!showPrices)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase transition-all select-none border ${showPrices
                            ? "bg-white text-black border-white"
                            : "bg-transparent text-white/70 border-white/20 hover:border-white/50"
                            }`}
                    >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Prices</span>
                    </button>
                </div>
            </div>

            {/* Grid Wall */}
            <div
                className="w-full min-h-screen pb-32 pt-0" // Padding bottom for footer controls
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
                    gap: "0rem",
                }}
            >
                {posters.map((item, index) => {
                    const price = getItemPrice(item);
                    return (
                        <motion.div
                            key={item.id}
                            layoutId={`poster-${item.id}`} // Shared layout ID for seamless transition
                            className="relative aspect-[2/3] w-full cursor-pointer overflow-hidden group"
                            onClick={() => setSelectedIndex(index)}
                            whileHover={{ zIndex: 10 }}
                        >
                            <img
                                src={item.url}
                                alt={item.title || `Poster ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />

                            {/* Overlays on Cell */}
                            {(showNames || showPrices) && (
                                <div className="absolute inset-0 bg-black/10 flex flex-col justify-end p-4 transition-opacity duration-300">
                                    {showNames && (
                                        <p className="text-white font-bold uppercase tracking-wide text-xs md:text-sm drop-shadow-md truncate">
                                            {item.title || `${project.title} #${index + 1}`}
                                        </p>
                                    )}
                                    {showPrices && price && (
                                        <Badge variant="secondary" className="mt-1 w-fit text-[10px] md:text-xs bg-white/90 text-black hover:bg-white shadow-sm">
                                            {price}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Expanded View Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedIndex(null)}
                    >
                        {/* Navigation Arrows */}
                        <button
                            className="absolute left-4 z-50 p-2 text-white/50 hover:text-white hover:scale-110 transition-all disabled:opacity-20 hidden md:block"
                            onClick={handlePrev}
                            disabled={selectedIndex === 0}
                        >
                            <ChevronLeft className="w-12 h-12" />
                        </button>

                        <button
                            className="absolute right-4 z-50 p-2 text-white/50 hover:text-white hover:scale-110 transition-all disabled:opacity-20 hidden md:block"
                            onClick={handleNext}
                            disabled={selectedIndex === posters.length - 1}
                        >
                            <ChevronRight className="w-12 h-12" />
                        </button>

                        {/* Main Content */}
                        <motion.div
                            className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-12 pointer-events-none"
                            layoutId={`poster-${selectedItem.id}`}
                        >
                            <div className="relative pointer-events-auto flex flex-col items-center max-h-[85vh] max-w-[90vw] md:max-w-4xl">
                                {/* Close Button */}
                                <button
                                    onClick={() => setSelectedIndex(null)}
                                    className="absolute -top-12 right-0 md:-right-12 text-white hover:text-red-500 transition-colors z-50"
                                >
                                    <X className="w-8 h-8" />
                                </button>

                                {/* Image Wrapper */}
                                <div className="relative shadow-2xl bg-neutral-900 group">
                                    <img
                                        src={selectedItem.url}
                                        className="max-h-[75vh] md:max-h-[80vh] w-auto object-contain"
                                        alt="Selected Poster"
                                    />

                                    {/* Overlay Tag (Bottom Right) */}
                                    {getItemShopUrl(selectedItem) ? (
                                        <a
                                            href={getItemShopUrl(selectedItem)!}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute -bottom-6 -right-4 md:bottom-8 md:-right-8 bg-white text-black p-3 md:p-4 rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,0.5)] transform rotate-[-2deg] hover:rotate-0 hover:scale-110 transition-all flex flex-col items-start cursor-pointer z-50 border-2 border-black min-w-[140px] max-w-[280px] group/tag"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <span className="font-black uppercase text-sm md:text-base leading-tight mb-2 w-full text-left break-words">
                                                {selectedItem.title || project.title}
                                            </span>

                                            <div className="bg-black text-white px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold flex items-center justify-between gap-3 w-full group-hover/tag:bg-orange-500 transition-colors">
                                                <span>SHOP NOW</span>
                                                {getItemPrice(selectedItem) && (
                                                    <span className="font-mono opacity-90 border-l border-white/30 pl-3">
                                                        {getItemPrice(selectedItem)}
                                                    </span>
                                                )}
                                            </div>
                                        </a>
                                    ) : (
                                        /* No Link - Just Tag Info */
                                        <div className="absolute -bottom-6 -right-4 md:bottom-8 md:-right-8 bg-white text-black p-3 md:p-4 rounded-xl shadow-[5px_5px_0px_0px_rgba(0,0,0,0.5)] transform rotate-[-2deg] flex flex-col items-start z-50 border-2 border-black min-w-[140px] max-w-[280px]">
                                            <span className="font-black uppercase text-sm md:text-base leading-tight mb-2 w-full text-left break-words">
                                                {selectedItem.title || project.title}
                                            </span>

                                            {getItemPrice(selectedItem) && (
                                                <div className="bg-neutral-100 text-neutral-500 px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center w-full">
                                                    <span className="font-mono">{getItemPrice(selectedItem)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Navigation Hints (Bottom) */}
                                <div className="flex md:hidden gap-12 mt-8 pt-0">
                                    <button className="p-2 text-white/60 active:text-white disabled:opacity-20" onClick={handlePrev} disabled={selectedIndex === 0}>
                                        <ChevronLeft className="w-8 h-8" />
                                    </button>
                                    <button className="p-2 text-white/60 active:text-white disabled:opacity-20" onClick={handleNext} disabled={selectedIndex === posters.length - 1}>
                                        <ChevronRight className="w-8 h-8" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
