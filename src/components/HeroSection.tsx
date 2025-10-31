import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import heroTerminal from '@/assets/hero-terminal.jpg';
import departuresHall from '@/assets/departures-hall.jpg';
import parkingService from '@/assets/parking-service.jpg';

const heroSlides = [
  {
    id: 1,
    image: heroTerminal,
    title: "Fast Track Arrivals",
    description: "Speed up the time it takes to get you on your way, with separate Fast Track lanes in passport control. Now available to book.",
    buttonText: "Book now",
    buttonVariant: "hero" as const
  },
  {
    id: 2,
    image: departuresHall,
    title: "Premium Departure Experience",
    description: "Enjoy our world-class departure lounges with premium amenities, comfortable seating, and exceptional service before your flight.",
    buttonText: "Explore lounges",
    buttonVariant: "accent" as const
  },
  {
    id: 3,
    image: parkingService,
    title: "Convenient Airport Parking",
    description: "Book your parking space in advance and enjoy seamless access to all terminals with our premium parking solutions.",
    buttonText: "Book parking",
    buttonVariant: "professional" as const
  }
];

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="relative h-[70vh] overflow-hidden">
      {/* Hero Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 hero-overlay" />
          </div>
          
          <div className="relative h-full flex items-center">
            <div className="container">
              <div className="max-w-2xl">
                <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
                  {slide.description}
                </p>
                <Button variant={slide.buttonVariant} size="lg" className="text-lg px-8 py-6">
                  {slide.buttonText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 backdrop-blur-sm text-primary-foreground border border-primary-foreground/20"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 backdrop-blur-sm text-primary-foreground border border-primary-foreground/20"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-primary-foreground shadow-lg' 
                : 'bg-primary-foreground/50 hover:bg-primary-foreground/70'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;