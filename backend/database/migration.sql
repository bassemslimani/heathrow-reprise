-- AeroWay Database Migration SQL
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    num_identite VARCHAR(50),
    telephone VARCHAR(20) NOT NULL,
    date_naissance DATE,
    lieu_naissance VARCHAR(100),
    ville VARCHAR(100),
    pays VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('passenger', 'visitor', 'admin')),
    ticket_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flights table
CREATE TABLE IF NOT EXISTS flights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    flight_number VARCHAR(20) UNIQUE NOT NULL,
    airline VARCHAR(100) NOT NULL,
    origin VARCHAR(100),
    destination VARCHAR(100),
    departure_time TIMESTAMP WITH TIME ZONE,
    arrival_time TIMESTAMP WITH TIME ZONE,
    gate VARCHAR(10),
    terminal VARCHAR(10),
    status VARCHAR(20) NOT NULL CHECK (status IN ('On Time', 'Delayed', 'Boarding', 'Departed', 'Landed', 'Arrived', 'Cancelled')),
    boarding_time TIMESTAMP WITH TIME ZONE,
    baggage_claim VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages/Chat history table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'bot')),
    message_text TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table (shops, restaurants, lounges, etc.)
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('shop', 'restaurant', 'cafe', 'lounge', 'bank', 'pharmacy', 'other')),
    location VARCHAR(100) NOT NULL,
    terminal VARCHAR(10),
    description TEXT,
    opening_hours VARCHAR(100),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spaces table (airport areas, zones, facilities)
CREATE TABLE IF NOT EXISTS spaces (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('gate', 'security', 'baggage', 'restroom', 'information', 'waiting_area', 'parking', 'other')),
    location VARCHAR(100) NOT NULL,
    terminal VARCHAR(10),
    description TEXT,
    opening_hours VARCHAR(100),
    image_url TEXT,
    coordinates JSONB,  -- For 3D map positioning {x, y, z}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE,
    related_flight_id UUID REFERENCES flights(id) ON DELETE SET NULL
);

-- Meet & Greet tracking table
CREATE TABLE IF NOT EXISTS meet_greet (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tracking_code VARCHAR(10) UNIQUE NOT NULL,
    passenger_id UUID REFERENCES users(id) ON DELETE CASCADE,
    passenger_name VARCHAR(200) NOT NULL,
    flight_id UUID REFERENCES flights(id) ON DELETE SET NULL,
    current_location VARCHAR(100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'completed', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_ticket_number ON users(ticket_number);
CREATE INDEX IF NOT EXISTS idx_flights_number ON flights(flight_number);
CREATE INDEX IF NOT EXISTS idx_flights_status ON flights(status);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_meet_greet_code ON meet_greet(tracking_code);
CREATE INDEX IF NOT EXISTS idx_meet_greet_passenger ON meet_greet(passenger_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flights_updated_at BEFORE UPDATE ON flights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing

-- Sample flights
INSERT INTO flights (flight_number, airline, origin, destination, departure_time, arrival_time, gate, terminal, status, boarding_time, baggage_claim) VALUES
('AF1234', 'Air France', 'Paris CDG', 'Heathrow', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '3 hours', 'A5', 'A', 'On Time', NOW() + INTERVAL '90 minutes', 'Carrousel 1'),
('BA567', 'British Airways', 'Heathrow', 'New York JFK', NOW() + INTERVAL '4 hours', NOW() + INTERVAL '12 hours', 'B12', 'B', 'Boarding', NOW() + INTERVAL '3.5 hours', NULL),
('EK123', 'Emirates', 'Dubai DXB', 'Heathrow', NOW() - INTERVAL '30 minutes', NOW(), 'B8', 'B', 'Landed', NULL, 'Carrousel 3'),
('LH890', 'Lufthansa', 'Frankfurt FRA', 'Heathrow', NOW() + INTERVAL '1 hour', NOW() + INTERVAL '2 hours', 'A10', 'A', 'On Time', NOW() + INTERVAL '30 minutes', 'Carrousel 1')
ON CONFLICT (flight_number) DO NOTHING;

-- Sample services
INSERT INTO services (name, category, location, terminal, description, opening_hours, image_url) VALUES
('Duty Free World', 'shop', 'Terminal A - Post Security', 'A', 'Luxury shopping with tax-free prices', '24/7', '/images/duty-free.jpg'),
('Starbucks Coffee', 'cafe', 'Terminal B - Main Hall', 'B', 'Fresh coffee and pastries', '05:00 - 23:00', '/images/starbucks.jpg'),
('Executive Lounge', 'lounge', 'Terminal A - Gate Area', 'A', 'Premium lounge with complimentary food and drinks', '06:00 - 22:00', '/images/lounge.jpg'),
('The Grain Store', 'restaurant', 'Terminal B - Departure Hall', 'B', 'Fresh seasonal British cuisine', '06:00 - 21:00', '/images/restaurant.jpg'),
('WHSmith', 'shop', 'Terminal A - Main Hall', 'A', 'Books, magazines, snacks and travel essentials', '05:00 - 23:00', '/images/whsmith.jpg')
ON CONFLICT DO NOTHING;

-- Sample spaces
INSERT INTO spaces (name, category, location, terminal, description, coordinates) VALUES
('Security Checkpoint A', 'security', 'Terminal A - Entrance', 'A', 'Main security checkpoint for Terminal A', '{"x": 10, "y": 0, "z": 20}'),
('Gate A5', 'gate', 'Terminal A - Gate Area', 'A', 'Boarding gate A5', '{"x": 50, "y": 0, "z": 30}'),
('Baggage Claim 1', 'baggage', 'Terminal A - Arrivals', 'A', 'Baggage carousel 1', '{"x": 15, "y": 0, "z": 5}'),
('Information Desk', 'information', 'Terminal A - Main Hall', 'A', 'Customer service and information', '{"x": 25, "y": 0, "z": 15}'),
('Restrooms A1', 'restroom', 'Terminal A - Main Hall', 'A', 'Public restrooms', '{"x": 20, "y": 0, "z": 10}')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE meet_greet ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (users can only access their own data)
CREATE POLICY users_select_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY messages_select_own ON messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY notifications_select_own ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY meet_greet_select_own ON meet_greet FOR SELECT USING (auth.uid() = passenger_id);

-- Allow public read access to flights, services, and spaces
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY flights_public_read ON flights FOR SELECT USING (true);
CREATE POLICY services_public_read ON services FOR SELECT USING (true);
CREATE POLICY spaces_public_read ON spaces FOR SELECT USING (true);

COMMENT ON TABLE users IS 'User accounts for passengers and visitors';
COMMENT ON TABLE flights IS 'Flight information and schedules';
COMMENT ON TABLE messages IS 'Chatbot conversation history';
COMMENT ON TABLE services IS 'Airport services like shops and restaurants';
COMMENT ON TABLE spaces IS 'Airport physical spaces and facilities';
COMMENT ON TABLE notifications IS 'User notifications and alerts';
COMMENT ON TABLE meet_greet IS 'Meet & Greet tracking system';
