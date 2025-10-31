import { create } from 'zustand';

export interface MapLocation {
  id: string;
  name: string;
  type: 'gate' | 'shop' | 'restaurant' | 'service' | 'security' | 'baggage' | 'parking' | 'terminal' | 'exit';
  position: [number, number, number];
  terminal?: string;
  description?: string;
  open?: boolean;
  waitTime?: number;
}

export interface UserPosition {
  position: [number, number, number];
  terminal?: string;
  lastUpdated: Date;
}

export interface NavigationPath {
  start: MapLocation;
  end: MapLocation;
  waypoints: [number, number, number][];
  distance: number;
  estimatedTime: number;
}

interface NavigationState {
  // User state
  userPosition: UserPosition | null;
  isTracking: boolean;
  userType: 'passenger' | 'visitor';
  
  // Navigation
  selectedLocation: MapLocation | null;
  currentPath: NavigationPath | null;
  isNavigating: boolean;
  
  // Filter and search
  searchQuery: string;
  activeFilters: string[];
  showOnlyOpen: boolean;
  
  // Map state
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  selectedTerminal: string | null;
  
  // Locations database
  locations: MapLocation[];
  
  // Actions
  setUserPosition: (position: UserPosition) => void;
  setUserType: (type: 'passenger' | 'visitor') => void;
  startTracking: () => void;
  stopTracking: () => void;
  selectLocation: (location: MapLocation) => void;
  navigateTo: (location: MapLocation) => void;
  stopNavigation: () => void;
  setSearchQuery: (query: string) => void;
  toggleFilter: (filter: string) => void;
  setCameraView: (position: [number, number, number], target: [number, number, number]) => void;
  selectTerminal: (terminal: string) => void;
  initializeLocations: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  // Initial state
  userPosition: null,
  isTracking: false,
  userType: 'passenger',
  selectedLocation: null,
  currentPath: null,
  isNavigating: false,
  searchQuery: '',
  activeFilters: [],
  showOnlyOpen: true,
  cameraPosition: [0, 100, 100],
  cameraTarget: [0, 0, 0],
  selectedTerminal: null,
  locations: [],

  // Actions
  setUserPosition: (position) => set({ userPosition: position }),
  
  setUserType: (type) => set({ userType: type }),
  
  startTracking: () => set({ isTracking: true }),
  
  stopTracking: () => set({ isTracking: false }),
  
  selectLocation: (location) => set({ selectedLocation: location }),
  
  navigateTo: (location) => {
    const { userPosition } = get();
    if (!userPosition) return;
    
    // Calculate simple path (in real app, this would use pathfinding algorithm)
    const start = userPosition.position;
    const end = location.position;
    const waypoints = [start, end]; // Simplified
    const distance = Math.sqrt(
      Math.pow(end[0] - start[0], 2) + 
      Math.pow(end[2] - start[2], 2)
    );
    const estimatedTime = Math.ceil(distance / 5); // 5 units per minute
    
    const path: NavigationPath = {
      start: {
        id: 'current',
        name: 'Ma position',
        type: 'service',
        position: start
      },
      end: location,
      waypoints,
      distance,
      estimatedTime
    };
    
    set({ 
      currentPath: path, 
      isNavigating: true, 
      selectedLocation: location 
    });
  },
  
  stopNavigation: () => set({ 
    currentPath: null, 
    isNavigating: false 
  }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  toggleFilter: (filter) => {
    const { activeFilters } = get();
    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter(f => f !== filter)
      : [...activeFilters, filter];
    set({ activeFilters: newFilters });
  },
  
  setCameraView: (position, target) => set({ 
    cameraPosition: position, 
    cameraTarget: target 
  }),
  
  selectTerminal: (terminal) => set({ selectedTerminal: terminal }),
  
  initializeLocations: () => {
    const locations: MapLocation[] = [
      // Terminal A Gates
      { id: 'A1', name: 'Porte A1', type: 'gate', position: [-50, 0, -30], terminal: 'A', description: 'Vol AF1234 vers Paris' },
      { id: 'A5', name: 'Porte A5', type: 'gate', position: [-40, 0, -30], terminal: 'A', description: 'Vol BA567 vers London' },
      { id: 'A10', name: 'Porte A10', type: 'gate', position: [-30, 0, -30], terminal: 'A', description: 'Vol LH890 vers Frankfurt' },
      
      // Terminal B Gates
      { id: 'B12', name: 'Porte B12', type: 'gate', position: [30, 0, -30], terminal: 'B', description: 'Vol EK123 vers Dubai' },
      { id: 'B15', name: 'Porte B15', type: 'gate', position: [40, 0, -30], terminal: 'B', description: 'Vol AA456 vers New York' },
      { id: 'B20', name: 'Porte B20', type: 'gate', position: [50, 0, -30], terminal: 'B', description: 'Vol QR789 vers Doha' },
      
      // Terminal C Gates
      { id: 'C5', name: 'Porte C5', type: 'gate', position: [0, 0, 50], terminal: 'C', description: 'Vol TK111 vers Istanbul' },
      { id: 'C10', name: 'Porte C10', type: 'gate', position: [10, 0, 50], terminal: 'C', description: 'Vol SV222 vers Riyadh' },
      
      // Shops
      { id: 'duty1', name: 'Duty Free Central', type: 'shop', position: [0, 0, 0], open: true, description: 'Parfums, alcools, souvenirs' },
      { id: 'shop1', name: 'Boutique Mode', type: 'shop', position: [-20, 0, 10], open: true, description: 'Vêtements et accessoires' },
      { id: 'shop2', name: 'Électronique', type: 'shop', position: [20, 0, 10], open: true, description: 'Téléphones, écouteurs, gadgets' },
      
      // Restaurants
      { id: 'rest1', name: 'Café Central', type: 'restaurant', position: [-10, 0, 5], open: true, description: 'Café, sandwichs, pâtisseries' },
      { id: 'rest2', name: 'Restaurant Méditerranéen', type: 'restaurant', position: [15, 0, 5], open: true, description: 'Cuisine méditerranéenne' },
      { id: 'rest3', name: 'Fast Food', type: 'restaurant', position: [0, 0, 20], open: true, description: 'Burgers, pizzas' },
      
      // Services
      { id: 'security1', name: 'Contrôle Sécurité A', type: 'security', position: [-40, 0, 0], waitTime: 15, description: 'Point de contrôle principal Terminal A' },
      { id: 'security2', name: 'Contrôle Sécurité B', type: 'security', position: [40, 0, 0], waitTime: 8, description: 'Point de contrôle principal Terminal B' },
      { id: 'baggage1', name: 'Récupération Bagages 1', type: 'baggage', position: [-30, 0, 30], description: 'Vols européens' },
      { id: 'baggage2', name: 'Récupération Bagages 2', type: 'baggage', position: [30, 0, 30], description: 'Vols internationaux' },
      
      // Parking
      { id: 'parking1', name: 'Parking P1', type: 'parking', position: [-70, 0, 70], description: 'Parking courte durée' },
      { id: 'parking2', name: 'Parking P2', type: 'parking', position: [70, 0, 70], description: 'Parking longue durée' },
      
      // Customer Service
      { id: 'info1', name: 'Information Central', type: 'service', position: [0, 0, -10], open: true, description: 'Renseignements et assistance' },
      { id: 'lost1', name: 'Objets Perdus', type: 'service', position: [-25, 0, 20], open: true, description: 'Service objets perdus' },
      
      // Emergency Exits
      { id: 'exit1', name: 'Sortie Urgence A', type: 'exit', position: [-60, 0, -20], description: 'Sortie de secours Terminal A' },
      { id: 'exit2', name: 'Sortie Urgence B', type: 'exit', position: [60, 0, -20], description: 'Sortie de secours Terminal B' },
    ];
    
    set({ locations });
  }
}));