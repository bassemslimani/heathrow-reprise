import { Button } from '@/components/ui/button';
import { 
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import aerowayLogo from '@/assets/aeroway-logo.png';

const Footer = () => {
  const footerSections = [
    {
      title: "Flight Information",
      links: [
        "Arrivals",
        "Departures", 
        "Flight Status",
        "Airlines",
        "Destinations"
      ]
    },
    {
      title: "At the Airport",
      links: [
        "Terminal Maps",
        "Parking",
        "Shopping",
        "Restaurants",
        "Services"
      ]
    },
    {
      title: "Travel Planning",
      links: [
        "Hotels",
        "Car Rental",
        "Travel Insurance",
        "Currency Exchange",
        "Baggage Info"
      ]
    },
    {
      title: "Support",
      links: [
        "Customer Service",
        "FAQs",
        "Accessibility",
        "Lost & Found",
        "Feedback"
      ]
    }
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <img src={aerowayLogo} alt="Aero Way" className="h-10 w-auto" />
            </div>
            <p className="text-primary-foreground/80 mb-6 leading-relaxed">
              Your premier gateway to the world, connecting you to over 200 destinations across the globe.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary-foreground/10">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-4 text-lg">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href="#" 
                      className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="border-t border-primary-foreground/20 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-accent" />
              <div>
                <div className="font-medium">Address</div>
                <div className="text-sm text-primary-foreground/80">Longford, Hounslow TW6 1QG, UK</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-accent" />
              <div>
                <div className="font-medium">24/7 Support</div>
                <div className="text-sm text-primary-foreground/80">+44 844 335 1801</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-accent" />
              <div>
                <div className="font-medium">Email</div>
                <div className="text-sm text-primary-foreground/80">info@aeroway.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-primary-foreground/10 rounded-lg p-6 mb-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
            <p className="text-primary-foreground/80 mb-4">
              Get the latest flight information and airport updates delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-2 rounded-md bg-primary-foreground/20 border border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Button variant="accent">Subscribe</Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-primary-foreground/80 mb-4 md:mb-0">
            © 2024 Aero Way. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              Cookie Policy
            </a>
            <a href="#" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;