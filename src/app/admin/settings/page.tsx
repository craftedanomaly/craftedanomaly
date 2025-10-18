'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, FileText, Instagram, Mail, Home, Save, Globe, ImageIcon, Phone, MapPin, Twitter, Linkedin, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { ImageUpload } from '@/components/admin/image-upload';

interface SiteSettings {
  site_name: string;
  site_description: string;
  company_name: string;
  company_tagline: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  admin_email: string;
  logo_url: string;
  logo_light_url: string;
  logo_dark_url: string;
  logo_alt: string;
  favicon_url: string;
  about_title: string;
  about_text: string;
  about_image_url: string;
  footer_explore_title: string;
  footer_contact_title: string;
  footer_bottom_text: string;
  footer_copyright_text: string;
  contact_page_title: string;
  contact_page_subtitle: string;
  contact_info_title: string;
  contact_info_description: string;
  working_hours_title: string;
  working_hours_monday_friday: string;
  working_hours_saturday: string;
  working_hours_sunday: string;
  contact_consent_text: string;
  homepage_fields_title: string;
  homepage_fields_subtitle: string;
  social_instagram: string;
  social_twitter: string;
  social_linkedin: string;
  social_behance: string;
  social_dribbble: string;
  social_youtube: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: '',
    site_description: '',
    company_name: '',
    company_tagline: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    admin_email: '',
    logo_url: '',
    logo_light_url: '',
    logo_dark_url: '',
    logo_alt: '',
    favicon_url: '',
    about_title: '',
    about_text: '',
    about_image_url: '',
    footer_explore_title: '',
    footer_contact_title: '',
    footer_bottom_text: '',
    footer_copyright_text: '',
    contact_page_title: '',
    contact_page_subtitle: '',
    contact_info_title: '',
    contact_info_description: '',
    working_hours_title: '',
    working_hours_monday_friday: '',
    working_hours_saturday: '',
    working_hours_sunday: '',
    contact_consent_text: '',
    homepage_fields_title: '',
    homepage_fields_subtitle: '',
    social_instagram: '',
    social_twitter: '',
    social_linkedin: '',
    social_behance: '',
    social_dribbble: '',
    social_youtube: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      }

      // Use data from database if available, otherwise use defaults
      const settingsObj: SiteSettings = {
        site_name: data?.site_name || 'Crafted Anomaly',
        site_description: data?.site_description || 'Museum-Grade Portfolio - Design Studio',
        company_name: data?.company_name || 'Crafted Anomaly',
        company_tagline: data?.company_tagline || 'Crafting Dreams Into Reality',
        contact_email: data?.contact_email || 'hello@craftedanomaly.com',
        contact_phone: data?.contact_phone || '+90 xxx xxx xx xx',
        contact_address: data?.contact_address || 'Istanbul, Turkey',
        admin_email: data?.admin_email || 'admin@craftedanomaly.com',
        logo_url: data?.logo_url || '/Anomaly.png',
        logo_light_url: data?.logo_light_url || '/Anomaly.png',
        logo_dark_url: data?.logo_dark_url || '/Anomaly.png',
        logo_alt: data?.logo_alt || 'Crafted Anomaly',
        favicon_url: data?.favicon_url || '/Anomaly.png',
        about_title: data?.about_title || data?.about_title_en || 'about',
        about_text: data?.about_text || data?.about_text_en || 'crafted anomaly is a design studio that transforms visions into tangible experiences. we specialize in creating museum-grade portfolios that blur the lines between art and functionality.',
        about_image_url: data?.about_image_url || '',
        footer_explore_title: data?.footer_explore_title || 'explore',
        footer_contact_title: data?.footer_contact_title || 'contact',
        footer_bottom_text: data?.footer_bottom_text || 'crafted with care in istanbul',
        footer_copyright_text: data?.footer_copyright_text || 'all rights reserved',
        contact_page_title: data?.contact_page_title || 'get in touch',
        contact_page_subtitle: data?.contact_page_subtitle || 'let\'s discuss your next project and bring your vision to life',
        contact_info_title: data?.contact_info_title || 'contact information',
        contact_info_description: data?.contact_info_description || 'Feel free to reach out through any of these channels. We typically respond within 24 hours.',
        working_hours_title: data?.working_hours_title || 'working hours',
        working_hours_monday_friday: data?.working_hours_monday_friday || 'Monday - Friday: 9:00 AM - 6:00 PM',
        working_hours_saturday: data?.working_hours_saturday || 'Saturday: 10:00 AM - 4:00 PM',
        working_hours_sunday: data?.working_hours_sunday || 'Sunday: Closed',
        contact_consent_text: data?.contact_consent_text || 'I consent to being contacted via email regarding this inquiry',
        homepage_fields_title: data?.homepage_fields_title || data?.homepage_fields_title_en || 'our fields',
        homepage_fields_subtitle: data?.homepage_fields_subtitle || data?.homepage_fields_subtitle_en || 'explore our diverse portfolio of creative disciplines, each crafted with precision and passion',
        social_instagram: data?.social_instagram || '',
        social_twitter: data?.social_twitter || '',
        social_linkedin: data?.social_linkedin || '',
        social_behance: data?.social_behance || '',
        social_dribbble: data?.social_dribbble || '',
        social_youtube: data?.social_youtube || '',
      };

      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
      // Use default values on error
      setSettings({
        site_name: 'Crafted Anomaly',
        site_description: 'Museum-Grade Portfolio - Design Studio',
        company_name: 'Crafted Anomaly',
        company_tagline: 'Crafting Dreams Into Reality',
        contact_email: 'hello@craftedanomaly.com',
        contact_phone: '+90 xxx xxx xx xx',
        contact_address: 'Istanbul, Turkey',
        admin_email: 'admin@craftedanomaly.com',
        logo_url: '/Anomaly.png',
        logo_light_url: '/Anomaly.png',
        logo_dark_url: '/Anomaly.png',
        logo_alt: 'Crafted Anomaly',
        favicon_url: '/Anomaly.png',
        about_title: 'about',
        about_text: 'crafted anomaly is a design studio that transforms visions into tangible experiences. we specialize in creating museum-grade portfolios that blur the lines between art and functionality.',
        about_image_url: '',
        footer_explore_title: 'explore',
        footer_contact_title: 'contact',
        footer_bottom_text: 'crafted with care in istanbul',
        footer_copyright_text: 'all rights reserved',
        contact_page_title: 'get in touch',
        contact_page_subtitle: 'let\'s discuss your next project and bring your vision to life',
        contact_info_title: 'contact information',
        contact_info_description: 'Feel free to reach out through any of these channels. We typically respond within 24 hours.',
        working_hours_title: 'working hours',
        working_hours_monday_friday: 'Monday - Friday: 9:00 AM - 6:00 PM',
        working_hours_saturday: 'Saturday: 10:00 AM - 4:00 PM',
        working_hours_sunday: 'Sunday: Closed',
        contact_consent_text: 'I consent to being contacted via email regarding this inquiry',
        homepage_fields_title: 'our fields',
        homepage_fields_subtitle: 'explore our diverse portfolio of creative disciplines, each crafted with precision and passion',
        social_instagram: '',
        social_twitter: '',
        social_linkedin: '',
        social_behance: '',
        social_dribbble: '',
        social_youtube: '',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Use direct column update instead of key-value pairs
      // First try to get existing record
      const { data: existingData } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)
        .single();

      let error;
      if (existingData?.id) {
        // Update existing record
        const result = await supabase
          .from('site_settings')
          .update(settings)
          .eq('id', existingData.id);
        error = result.error;
      } else {
        // Insert new record
        const result = await supabase
          .from('site_settings')
          .insert(settings);
        error = result.error;
      }

      if (error) {
        console.error('Error saving settings:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // If table doesn't exist, show helpful message
        if (error.code === 'PGRST116' || error.message.includes('relation "site_settings" does not exist')) {
          toast.error('Please create the site_settings table first. Check the SQL file.');
          return;
        }
        
        // Show specific error message
        const errorMsg = error.message || error.details || 'Unknown error';
        toast.error(`Failed to save settings: ${errorMsg}`);
        return;
      }

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: keyof SiteSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLogoUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }

      setIsUploadingLogo(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;
        const filePath = `branding/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error details:', uploadError);
          toast.error(`Upload failed: ${uploadError.message}`);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        handleChange('logo_url', publicUrl);
        toast.success('Logo uploaded successfully!');
      } catch (error) {
        console.error('Error uploading logo:', error);
        toast.error('Failed to upload logo');
      } finally {
        setIsUploadingLogo(false);
      }
    };

    input.click();
  };

  const handleImageUpload = async (settingKey: keyof SiteSettings) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }

      setIsUploadingLogo(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${settingKey}-${Date.now()}.${fileExt}`;
        const filePath = `content/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('media')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error details:', uploadError);
          toast.error(`Upload failed: ${uploadError.message}`);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        handleChange(settingKey, publicUrl);
        toast.success('Image uploaded successfully!');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
      } finally {
        setIsUploadingLogo(false);
      }
    };

    input.click();
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your site configuration
            </p>
          </div>
          <Button className="gap-2" onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <div className="space-y-8">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Globe className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">General Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={settings.site_name}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  placeholder="Crafted Anomaly"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={settings.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  placeholder="Crafted Anomaly"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={settings.site_description}
                  onChange={(e) => handleChange('site_description', e.target.value)}
                  placeholder="Museum-Grade Portfolio - Design Studio"
                  rows={3}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company_tagline">Company Tagline</Label>
                <Input
                  id="company_tagline"
                  value={settings.company_tagline}
                  onChange={(e) => handleChange('company_tagline', e.target.value)}
                  placeholder="Crafting Dreams Into Reality"
                />
              </div>
            </div>
          </motion.div>

          {/* Branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Branding</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Light Mode Logo */}
              <div className="space-y-2">
                <Label>Light Mode Logo</Label>
                <ImageUpload
                  value={settings.logo_light_url}
                  onChange={(url) => handleChange('logo_light_url', url)}
                />
                <p className="text-xs text-muted-foreground">
                  Logo to display in light mode (on cream background)
                </p>
              </div>

              {/* Dark Mode Logo */}
              <div className="space-y-2">
                <Label>Dark Mode Logo</Label>
                <ImageUpload
                  value={settings.logo_dark_url}
                  onChange={(url) => handleChange('logo_dark_url', url)}
                />
                <p className="text-xs text-muted-foreground">
                  Logo to display in dark mode (on dark background)
                </p>
              </div>

              {/* Legacy Logo URL (for backward compatibility) */}
              <div className="space-y-2">
                <Label htmlFor="logo_url">Legacy Logo URL</Label>
                <div className="flex gap-3">
                  <Input
                    id="logo_url"
                    value={settings.logo_url}
                    onChange={(e) => handleChange('logo_url', e.target.value)}
                    placeholder="/Anomaly.png or https://..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Upload Logo"
                    onClick={handleLogoUpload}
                    disabled={isUploadingLogo}
                  >
                    {isUploadingLogo ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Logo displayed in the header. Recommended size: 200x80px
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="logo_alt">Logo Alt Text</Label>
                  <Input
                    id="logo_alt"
                    value={settings.logo_alt}
                    onChange={(e) => handleChange('logo_alt', e.target.value)}
                    placeholder="Crafted Anomaly"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="favicon_url">Favicon URL</Label>
                  <div className="flex gap-3">
                    <Input
                      id="favicon_url"
                      value={settings.favicon_url}
                      onChange={(e) => handleChange('favicon_url', e.target.value)}
                      placeholder="/Anomaly.png"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Upload Favicon"
                      onClick={() => handleImageUpload('favicon_url')}
                      disabled={isUploadingLogo}
                    >
                      {isUploadingLogo ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Icon displayed in browser tabs. Recommended size: 32x32px
                  </p>
                  
                  {/* Favicon Preview */}
                  {settings.favicon_url && (
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={settings.favicon_url}
                        alt="Favicon Preview"
                        className="w-4 h-4"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <span className="text-xs text-muted-foreground">Favicon Preview</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Logo Preview */}
              {settings.logo_url && (
                <div className="space-y-2">
                  <Label>Logo Preview</Label>
                  <div className="border border-border rounded-lg p-4 bg-muted/20">
                    <img
                      src={settings.logo_url}
                      alt={settings.logo_alt}
                      className="h-16 w-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Mail className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Contact Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contact_email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    placeholder="hello@craftedanomaly.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contact_phone"
                    value={settings.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    placeholder="+90 xxx xxx xx xx"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact_address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="contact_address"
                    value={settings.contact_address}
                    onChange={(e) => handleChange('contact_address', e.target.value)}
                    placeholder="Istanbul, Turkey"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="admin_email">Admin Email (Notification Recipient)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin_email"
                    type="email"
                    value={settings.admin_email}
                    onChange={(e) => handleChange('admin_email', e.target.value)}
                    placeholder="admin@craftedanomaly.com"
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Contact form notifications will be sent to this email address
                </p>
              </div>
            </div>
          </motion.div>

          {/* Content Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Content Management</h2>
            </div>
            
            <div className="space-y-6">
              {/* About Section Title */}
              <div className="space-y-2">
                <Label htmlFor="about_title">About Title</Label>
                <Input
                  id="about_title"
                  value={settings.about_title}
                  onChange={(e) => handleChange('about_title', e.target.value)}
                  placeholder="about"
                />
              </div>

              {/* About Section Text */}
              <div className="space-y-2">
                <Label htmlFor="about_text">About Text</Label>
                <Textarea
                  id="about_text"
                  value={settings.about_text}
                  onChange={(e) => handleChange('about_text', e.target.value)}
                  placeholder="Describe your studio..."
                  rows={4}
                />
              </div>

              {/* Studio Image */}
              <div className="space-y-2">
                <Label htmlFor="about_image_url">Studio Image</Label>
                <div className="flex gap-3">
                  <Input
                    id="about_image_url"
                    value={settings.about_image_url}
                    onChange={(e) => handleChange('about_image_url', e.target.value)}
                    placeholder="https://... or /studio-image.jpg"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Upload Studio Image"
                    onClick={() => handleImageUpload('about_image_url')}
                    disabled={isUploadingLogo}
                  >
                    {isUploadingLogo ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Image displayed in the about section. Recommended size: 600x400px
                </p>
              </div>

              {/* Studio Image Preview */}
              {settings.about_image_url && (
                <div className="space-y-2">
                  <Label>Studio Image Preview</Label>
                  <div className="border border-border rounded-lg p-4 bg-muted/20">
                    <img
                      src={settings.about_image_url}
                      alt="Studio Image"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Footer Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Footer Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="footer_explore_title">Explore Section Title</Label>
                <Input
                  id="footer_explore_title"
                  value={settings.footer_explore_title}
                  onChange={(e) => handleChange('footer_explore_title', e.target.value)}
                  placeholder="explore"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer_contact_title">Contact Section Title</Label>
                <Input
                  id="footer_contact_title"
                  value={settings.footer_contact_title}
                  onChange={(e) => handleChange('footer_contact_title', e.target.value)}
                  placeholder="contact"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer_bottom_text">Bottom Text</Label>
                <Input
                  id="footer_bottom_text"
                  value={settings.footer_bottom_text}
                  onChange={(e) => handleChange('footer_bottom_text', e.target.value)}
                  placeholder="crafted with care in istanbul"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer_copyright_text">Copyright Text</Label>
                <Input
                  id="footer_copyright_text"
                  value={settings.footer_copyright_text}
                  onChange={(e) => handleChange('footer_copyright_text', e.target.value)}
                  placeholder="all rights reserved"
                />
              </div>
            </div>
          </motion.div>

          {/* Contact Page Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Mail className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Contact Page Settings</h2>
            </div>
            
            <div className="space-y-6">
              {/* Page Headers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contact_page_title">Page Title</Label>
                  <Input
                    id="contact_page_title"
                    value={settings.contact_page_title}
                    onChange={(e) => handleChange('contact_page_title', e.target.value)}
                    placeholder="get in touch"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_info_title">Contact Info Title</Label>
                  <Input
                    id="contact_info_title"
                    value={settings.contact_info_title}
                    onChange={(e) => handleChange('contact_info_title', e.target.value)}
                    placeholder="contact information"
                  />
                </div>
              </div>

              {/* Page Subtitle */}
              <div className="space-y-2">
                <Label htmlFor="contact_page_subtitle">Page Subtitle</Label>
                <Textarea
                  id="contact_page_subtitle"
                  value={settings.contact_page_subtitle}
                  onChange={(e) => handleChange('contact_page_subtitle', e.target.value)}
                  placeholder="let's discuss your next project and bring your vision to life"
                  rows={2}
                />
              </div>

              {/* Contact Info Description */}
              <div className="space-y-2">
                <Label htmlFor="contact_info_description">Contact Info Description</Label>
                <Textarea
                  id="contact_info_description"
                  value={settings.contact_info_description}
                  onChange={(e) => handleChange('contact_info_description', e.target.value)}
                  placeholder="Feel free to reach out through any of these channels..."
                  rows={3}
                />
              </div>

              {/* Working Hours */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Working Hours</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="working_hours_title">Working Hours Title</Label>
                    <Input
                      id="working_hours_title"
                      value={settings.working_hours_title}
                      onChange={(e) => handleChange('working_hours_title', e.target.value)}
                      placeholder="working hours"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_consent_text">Consent Text</Label>
                    <Input
                      id="contact_consent_text"
                      value={settings.contact_consent_text}
                      onChange={(e) => handleChange('contact_consent_text', e.target.value)}
                      placeholder="I consent to being contacted..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="working_hours_monday_friday">Monday - Friday</Label>
                    <Input
                      id="working_hours_monday_friday"
                      value={settings.working_hours_monday_friday}
                      onChange={(e) => handleChange('working_hours_monday_friday', e.target.value)}
                      placeholder="Monday - Friday: 9:00 AM - 6:00 PM"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="working_hours_saturday">Saturday</Label>
                      <Input
                        id="working_hours_saturday"
                        value={settings.working_hours_saturday}
                        onChange={(e) => handleChange('working_hours_saturday', e.target.value)}
                        placeholder="Saturday: 10:00 AM - 4:00 PM"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="working_hours_sunday">Sunday</Label>
                      <Input
                        id="working_hours_sunday"
                        value={settings.working_hours_sunday}
                        onChange={(e) => handleChange('working_hours_sunday', e.target.value)}
                        placeholder="Sunday: Closed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Homepage Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Home className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Homepage Settings</h2>
            </div>
            
            <div className="space-y-6">
              {/* Fields Section Title */}
              <div className="space-y-2">
                <Label htmlFor="homepage_fields_title">Fields Title</Label>
                <Input
                  id="homepage_fields_title"
                  value={settings.homepage_fields_title}
                  onChange={(e) => handleChange('homepage_fields_title', e.target.value)}
                  placeholder="our fields"
                />
              </div>

              {/* Fields Section Subtitle */}
              <div className="space-y-2">
                <Label htmlFor="homepage_fields_subtitle">Fields Subtitle</Label>
                <Textarea
                  id="homepage_fields_subtitle"
                  value={settings.homepage_fields_subtitle}
                  onChange={(e) => handleChange('homepage_fields_subtitle', e.target.value)}
                  placeholder="explore our diverse portfolio of creative disciplines..."
                  rows={3}
                />
              </div>
            </div>
          </motion.div>

          {/* Social Media Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Instagram className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Social Media Links</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="social_instagram">Instagram</Label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="social_instagram"
                    value={settings.social_instagram}
                    onChange={(e) => handleChange('social_instagram', e.target.value)}
                    placeholder="https://instagram.com/craftedanomaly"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="social_twitter">Twitter</Label>
                <div className="relative">
                  <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="social_twitter"
                    value={settings.social_twitter}
                    onChange={(e) => handleChange('social_twitter', e.target.value)}
                    placeholder="https://twitter.com/craftedanomaly"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="social_linkedin">LinkedIn</Label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="social_linkedin"
                    value={settings.social_linkedin}
                    onChange={(e) => handleChange('social_linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/craftedanomaly"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="social_youtube">YouTube</Label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="social_youtube"
                    value={settings.social_youtube}
                    onChange={(e) => handleChange('social_youtube', e.target.value)}
                    placeholder="https://youtube.com/@craftedanomaly"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="social_behance">Behance</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="social_behance"
                    value={settings.social_behance}
                    onChange={(e) => handleChange('social_behance', e.target.value)}
                    placeholder="https://behance.net/craftedanomaly"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="social_dribbble">Dribbble</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="social_dribbble"
                    value={settings.social_dribbble}
                    onChange={(e) => handleChange('social_dribbble', e.target.value)}
                    placeholder="https://dribbble.com/craftedanomaly"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button onClick={handleSave} disabled={isSaving} size="lg" className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving Changes...' : 'Save All Settings'}
            </Button>
          </div>
        </div>
    </div>
  );
}
