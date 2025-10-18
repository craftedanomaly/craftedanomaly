'use client';

import { useState, useEffect } from 'react';
import { Globe, Mail, Instagram, Twitter, Linkedin, Youtube, Phone, Palette, Dribbble } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

export function Footer() {
  const locale = 'en';
  const router = useRouter();
  const pathname = usePathname();
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      const settingsObj: any = {};
      data?.forEach((setting: any) => {
        settingsObj[setting.setting_key] = setting.setting_value || '';
      });

      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const toggleLanguage = () => {
    // Temporarily disabled
  };

  const socialLinks = [
    {
      name: 'Email',
      href: `mailto:${settings.contact_email || 'hello@craftedanomaly.com'}`,
      icon: Mail,
      show: true,
    },
    {
      name: 'Instagram',
      href: settings.social_instagram,
      icon: Instagram,
      show: !!settings.social_instagram,
    },
    {
      name: 'Twitter',
      href: settings.social_twitter,
      icon: Twitter,
      show: !!settings.social_twitter,
    },
    {
      name: 'LinkedIn',
      href: settings.social_linkedin,
      icon: Linkedin,
      show: !!settings.social_linkedin,
    },
    {
      name: 'Behance',
      href: settings.social_behance,
      icon: Palette,
      show: !!settings.social_behance,
    },
    {
      name: 'Dribbble',
      href: settings.social_dribbble,
      icon: Dribbble,
      show: !!settings.social_dribbble,
    },
    {
      name: 'YouTube',
      href: settings.social_youtube,
      icon: Youtube,
      show: !!settings.social_youtube,
    },
  ].filter(link => link.show);

  const footerLinks = [
    { label: 'Films', href: '/films' },
    { label: 'Spatial Design', href: '/mekan-tasarimi' },
    { label: 'Visual Design', href: '/gorsel-tasarim' },
    { label: 'Games', href: '/games' },
    { label: 'Books', href: '/books' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <footer className="border-t border-border bg-card dark:bg-card light:bg-white light:border-slate-200">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {settings.company_name || 'crafted anomaly'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {settings.company_tagline || 'a design studio crafting dreams through films, spatial design, visual identity, and interactive experiences.'}
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-accent transition-colors"
                      aria-label={link.name}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                {settings.footer_explore_title || 'explore'}
              </h4>
              <ul className="space-y-3">
                {footerLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Language */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                {settings.footer_contact_title || 'contact'}
              </h4>
              <div className="space-y-3">
                {settings.contact_email && (
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    {settings.contact_email}
                  </a>
                )}
                {settings.contact_phone && (
                  <a
                    href={`tel:${settings.contact_phone.replace(/\s/g, '')}`}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    {settings.contact_phone}
                  </a>
                )}
                {settings.contact_address && (
                  <p className="text-sm text-muted-foreground">
                    {settings.contact_address}
                  </p>
                )}
                {/* Language Toggle */}
                <div className="pt-4">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      English
                    </span>
                  </div>
                  <Switch
                    checked={false}
                    onCheckedChange={toggleLanguage}
                    className="data-[state=checked]:bg-accent"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {settings.company_name || 'crafted anomaly'}. {settings.footer_copyright_text || 'all rights reserved'}.
            </p>
            <p className="text-sm text-muted-foreground">
              {settings.footer_bottom_text || 'crafted with care in istanbul'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
