import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Car, 
  MapPin, 
  Clock, 
  ShoppingBag,
  Utensils,
  Wifi,
  ArrowRight
} from 'lucide-react';

const services = [
  {
    id: 1,
    title: "Official Aero Way Parking",
    description: "Find the best parking solution for your trip.",
    icon: Car,
    color: "bg-accent/10 text-accent-foreground",
    iconColor: "text-accent",
    buttonText: "Book parking",
    buttonVariant: "professional" as const
  },
  {
    id: 2,
    title: "Which terminal?",
    description: "Find out the terminal your airline uses at Aero Way.",
    icon: MapPin,
    color: "bg-primary/10 text-primary",
    iconColor: "text-primary",
    buttonText: "Find my terminal",
    buttonVariant: "hero" as const
  },
  {
    id: 3,
    title: "Terminal Drop-Off",
    description: "The quickest way to drop off passengers.",
    icon: Clock,
    color: "bg-green-500/10 text-green-700",
    iconColor: "text-green-600",
    buttonText: "Find out more",
    buttonVariant: "outline" as const
  },
  {
    id: 4,
    title: "Shopping & Dining",
    description: "Discover world-class shopping and dining experiences.",
    icon: ShoppingBag,
    color: "bg-purple-500/10 text-purple-700",
    iconColor: "text-purple-600",
    buttonText: "Explore shops",
    buttonVariant: "accent" as const
  },
  {
    id: 5,
    title: "Premium Lounges",
    description: "Relax in comfort before your flight with premium lounge access.",
    icon: Utensils,
    color: "bg-blue-500/10 text-blue-700",
    iconColor: "text-blue-600",
    buttonText: "Book lounge",
    buttonVariant: "professional" as const
  },
  {
    id: 6,
    title: "Free Wi-Fi",
    description: "Stay connected with complimentary high-speed internet throughout the airport.",
    icon: Wifi,
    color: "bg-orange-500/10 text-orange-700",
    iconColor: "text-orange-600",
    buttonText: "Connect now",
    buttonVariant: "outline" as const
  }
];

const ServiceCards = () => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Airport Services</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Make your journey smoother with our comprehensive range of airport services and amenities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="card-hover group cursor-pointer h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className={`w-16 h-16 rounded-lg ${service.color} flex items-center justify-center mb-4`}>
                  <service.icon className={`h-8 w-8 ${service.iconColor}`} />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-muted-foreground mb-6 flex-grow leading-relaxed">
                  {service.description}
                </p>
                
                <Button 
                  variant={service.buttonVariant} 
                  className="w-full group-hover:scale-105 transition-transform"
                >
                  <span>{service.buttonText}</span>
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 text-center">
          <Card className="bg-primary text-primary-foreground p-8 shadow-elegant">
            <h3 className="text-2xl font-bold mb-4">Need More Help?</h3>
            <p className="text-lg mb-6 opacity-90">
              Our customer service team is available 24/7 to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="accent" size="lg">
                Contact Support
              </Button>
              <Button variant="outline" size="lg" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                Download App
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ServiceCards;