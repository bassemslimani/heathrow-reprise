import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Plane, 
  Search, 
  Calendar,
  Clock,
  MapPin,
  CloudSun,
  Car
} from 'lucide-react';

const FlightInformation = () => {
  const [activeTab, setActiveTab] = useState('departures');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'arrivals', label: 'Arrivals', icon: Plane },
    { id: 'departures', label: 'Departures', icon: Plane },
    { id: 'connections', label: 'Connections', icon: MapPin },
    { id: 'parking', label: 'Book Parking', icon: Car }
  ];

  const flightData = {
    departures: [
      { time: '14:30', destination: 'New York JFK', airline: 'British Airways', gate: 'A12', status: 'On Time' },
      { time: '15:15', destination: 'Paris CDG', airline: 'Air France', gate: 'B8', status: 'Boarding' },
      { time: '16:00', destination: 'Dubai DXB', airline: 'Emirates', gate: 'C15', status: 'Delayed' },
      { time: '16:45', destination: 'Frankfurt FRA', airline: 'Lufthansa', gate: 'A20', status: 'On Time' },
    ],
    arrivals: [
      { time: '14:15', origin: 'Los Angeles LAX', airline: 'Virgin Atlantic', gate: 'B12', status: 'Landed' },
      { time: '14:45', origin: 'Tokyo NRT', airline: 'Japan Airlines', gate: 'C8', status: 'On Time' },
      { time: '15:30', origin: 'Sydney SYD', airline: 'Qantas', gate: 'A15', status: 'On Time' },
      { time: '16:15', origin: 'Mumbai BOM', airline: 'Air India', gate: 'B20', status: 'Delayed' },
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on time': return 'text-green-600 bg-green-50';
      case 'boarding': return 'text-blue-600 bg-blue-50';
      case 'delayed': return 'text-red-600 bg-red-50';
      case 'landed': return 'text-purple-600 bg-purple-50';
      default: return 'text-muted-foreground bg-muted/50';
    }
  };

  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="container">
        {/* Weather and Location Info */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span className="font-medium">LONDON</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span className="font-medium">14:51</span>
            </div>
            <div className="flex items-center space-x-2">
              <CloudSun className="h-5 w-5" />
              <span className="font-medium">22°C</span>
            </div>
          </div>
        </div>

        {/* Flight Information Tabs */}
        <div className="bg-background/10 backdrop-blur-sm rounded-lg p-6">
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "accent" : "ghost"}
                className={`flex items-center space-x-2 ${
                  activeTab === tab.id 
                    ? 'text-accent-foreground' 
                    : 'text-primary-foreground hover:bg-primary-foreground/10'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>

          {/* Search and Date Picker */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search airline, flight no. or city"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/20 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Friday 5 September 2025</span>
            </div>
            <Button variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              View all {activeTab}
            </Button>
          </div>

          {/* Flight List */}
          {(activeTab === 'departures' || activeTab === 'arrivals') && (
            <div className="space-y-3">
              {flightData[activeTab as keyof typeof flightData].map((flight, index) => (
                <Card key={index} className="p-4 bg-background/20 border-primary-foreground/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="text-xl font-bold">{flight.time}</div>
                      <div>
                        <div className="font-medium">
                          {activeTab === 'departures' ? flight.destination : flight.origin}
                        </div>
                        <div className="text-sm text-primary-foreground/70">{flight.airline}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-primary-foreground/70">Gate</div>
                        <div className="font-medium">{flight.gate}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(flight.status)}`}>
                        {flight.status}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Connections Tab Content */}
          {activeTab === 'connections' && (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-primary-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">Connection Information</h3>
              <p className="text-primary-foreground/70 mb-6">Find information about connecting flights and transfer services.</p>
              <Button variant="accent">View Connection Guide</Button>
            </div>
          )}

          {/* Parking Tab Content */}
          {activeTab === 'parking' && (
            <div className="text-center py-12">
              <Car className="h-16 w-16 mx-auto mb-4 text-primary-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">Airport Parking</h3>
              <p className="text-primary-foreground/70 mb-6">Reserve your parking space and save time at the airport.</p>
              <Button variant="accent">Book Parking Now</Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FlightInformation;