"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  X,
  Mail,
  Phone,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Palette,
  Dribbble,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { getTransition, getVariants, TRANSITION } from "@/lib/motion-constants";

export function FloatingInfoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchSettings();
    fetchCategories();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;
      setSettings(data || {});
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("active", true)
        .order("display_order");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const normalizeUrl = (url?: string) => {
    if (!url) return "";
    const trimmed = String(url).trim();
    if (/^(https?:)?\/\//i.test(trimmed)) {
      return trimmed.startsWith("http") ? trimmed : `https:${trimmed}`;
    }
    if (/^(mailto:|tel:)/i.test(trimmed)) return trimmed;
    if (trimmed.startsWith("www.")) return `https://${trimmed}`;
    return `https://${trimmed}`;
  };

  const socialLinks = [
    {
      name: "Email",
      href: `mailto:${settings.contact_email || "hello@craftedanomaly.com"}`,
      icon: Mail,
      show: true,
    },
    {
      name: "Instagram",
      href: settings.social_instagram,
      icon: Instagram,
      show: !!settings.social_instagram,
    },
    {
      name: "Twitter",
      href: settings.social_twitter,
      icon: Twitter,
      show: !!settings.social_twitter,
    },
    {
      name: "LinkedIn",
      href: settings.social_linkedin,
      icon: Linkedin,
      show: !!settings.social_linkedin,
    },
    {
      name: "Behance",
      href: settings.social_behance,
      icon: Palette,
      show: !!settings.social_behance,
    },
    {
      name: "Dribbble",
      href: settings.social_dribbble,
      icon: Dribbble,
      show: !!settings.social_dribbble,
    },
    {
      name: "YouTube",
      href: settings.social_youtube,
      icon: Youtube,
      show: !!settings.social_youtube,
    },
  ].filter((link) => link.show);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-3 right-3 md:bottom-6 md:right-6 z-[60] flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full aspect-square bg-accent text-accent-foreground shadow-lg hover:shadow-xl transition-shadow backdrop-blur-sm border border-accent/20 pointer-events-auto"
        aria-label="Open info modal"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={getTransition("primary")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Info className="h-5 w-5 md:h-6 md:w-6" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[1000] bg-background/80 backdrop-blur-sm"
              {...getVariants("modalOverlay")}
              transition={getTransition("fast")}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              className="fixed inset-0 z-[1001] flex items-center justify-center p-4 md:p-6"
              {...getVariants("modalContent")}
              transition={getTransition("primary")}
            >
              <div className="relative w-full max-w-[min(960px,92vw)] md:max-w-[min(880px,88vw)] lg:max-w-[820px] max-h-[min(92vh,860px)] md:max-h-[85vh] overflow-y-auto rounded-2xl border border-border/70 bg-card/95 backdrop-blur-xl p-5 md:p-8 lg:p-10 shadow-2xl break-words text-base md:text-sm">
                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-5 top-5 md:right-6 md:top-6 flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-accent/10 text-foreground hover:bg-accent/20 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Content */}
                <div className="space-y-8 md:space-y-10">
                  {/* Header */}
                  <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                      {settings.company_name || "crafted anomaly"}
                    </h2>
                    <p className="text-muted-foreground">
                      {settings.company_tagline ||
                        "a design studio crafting dreams through films, spatial design, visual identity, and interactive experiences."}
                    </p>
                  </div>

                  {/* About (if exists) */}
                  {settings.about_text && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {settings.about_title || "About"}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {settings.about_text}
                      </p>
                    </div>
                  )}

                  {/* Contact */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground">
                      {settings.footer_contact_title || "Contact"}
                    </h3>
                    <div className="space-y-3">
                      {settings.contact_email && (
                        <a
                          href={`mailto:${settings.contact_email}`}
                          className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors"
                        >
                          <Mail className="h-5 w-5" />
                          <span>{settings.contact_email}</span>
                        </a>
                      )}
                      {settings.contact_phone && (
                        <a
                          href={`tel:${settings.contact_phone.replace(
                            /\s/g,
                            ""
                          )}`}
                          className="flex items-center gap-3 text-muted-foreground hover:text-accent transition-colors"
                        >
                          <Phone className="h-5 w-5" />
                          <span>{settings.contact_phone}</span>
                        </a>
                      )}
                      {settings.contact_address && (
                        <p className="flex items-start gap-3 text-muted-foreground">
                          <span className="mt-1">📍</span>
                          <span>{settings.contact_address}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Category Links */}
                  {categories.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        Categories
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {categories.map((category) => (
                          <a
                            key={category.id}
                            href={`/${category.slug}`}
                            className="group flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm font-medium text-foreground/80 hover:text-accent hover:border-accent transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <span>{category.name}</span>
                            <span className="text-xs text-muted-foreground group-hover:text-accent">
                              View
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  {socialLinks.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        Social
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {socialLinks.map((link) => {
                          const Icon = link.icon;
                          const href = link.href?.startsWith("mailto:")
                            ? link.href
                            : normalizeUrl(link.href);
                          if (!href) return null;
                          return (
                            <a
                              key={link.name}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-foreground hover:bg-accent/20 hover:text-accent transition-all"
                              aria-label={link.name}
                            >
                              <Icon className="h-5 w-5" />
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Copyright */}
                  <div className="pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground text-center">
                      © {new Date().getFullYear()}{" "}
                      {settings.company_name || "crafted anomaly"}.{" "}
                      {settings.footer_copyright_text || "all rights reserved"}.
                    </p>
                    {settings.footer_bottom_text && (
                      <p className="text-sm text-muted-foreground text-center mt-2">
                        {settings.footer_bottom_text}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
