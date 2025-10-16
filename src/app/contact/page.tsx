import { ContactForm } from '@/components/contact/contact-form';
import { createClient } from '@supabase/supabase-js';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getContactSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select(`
      contact_page_title,
      contact_page_subtitle,
      contact_info_title,
      contact_info_description,
      working_hours_title,
      working_hours_monday_friday,
      working_hours_saturday,
      working_hours_sunday,
      contact_consent_text,
      contact_email,
      contact_phone,
      contact_address
    `)
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching contact settings:', error);
    return {
      contact_page_title: 'Get in Touch',
      contact_page_subtitle: 'Let\'s discuss your next project and bring your vision to life',
      contact_info_title: 'Contact Information',
      contact_info_description: 'Feel free to reach out through any of these channels. We typically respond within 24 hours.',
      working_hours_title: 'Working Hours',
      working_hours_monday_friday: 'Monday - Friday: 9:00 AM - 6:00 PM',
      working_hours_saturday: 'Saturday: 10:00 AM - 4:00 PM',
      working_hours_sunday: 'Sunday: Closed',
      contact_consent_text: 'I consent to being contacted via email regarding this inquiry',
      contact_email: 'hello@craftedanomaly.com',
      contact_phone: '+90 xxx xxx xx xx',
      contact_address: 'Istanbul, Turkey'
    };
  }

  return data;
}

export default async function ContactPage() {
  const settings = await getContactSettings();

  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          {settings.contact_page_title}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {settings.contact_page_subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6">Send us a message</h2>
          <ContactForm settings={settings} />
        </div>

        {/* Contact Information */}
        <div className="space-y-8">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {settings.contact_info_title}
            </h2>
            <p className="text-muted-foreground mb-6">
              {settings.contact_info_description}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-accent" />
                <span className="text-foreground">{settings.contact_email}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-accent" />
                <span className="text-foreground">{settings.contact_phone}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-accent" />
                <span className="text-foreground">{settings.contact_address}</span>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              {settings.working_hours_title}
            </h3>
            
            <div className="space-y-2 text-muted-foreground">
              <p>{settings.working_hours_monday_friday}</p>
              <p>{settings.working_hours_saturday}</p>
              <p>{settings.working_hours_sunday}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
