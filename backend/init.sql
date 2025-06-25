
-- QR Scanner Party App Database Schema

-- Create database (this will be done by docker-compose, but kept for reference)
-- CREATE DATABASE qr_scanner_db;

-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  qr_code TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create checkins table
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  UNIQUE(guest_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_checkins_guest_id ON checkins(guest_id);
CREATE INDEX IF NOT EXISTS idx_checkins_timestamp ON checkins(timestamp);

-- Insert some sample data
INSERT INTO guests (id, name, email, qr_code) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Max Mustermann', 'max@example.com', '{"id":"550e8400-e29b-41d4-a716-446655440001","name":"Max Mustermann"}'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Anna Schmidt', 'anna@example.com', '{"id":"550e8400-e29b-41d4-a716-446655440002","name":"Anna Schmidt"}'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Peter Weber', 'peter@example.com', '{"id":"550e8400-e29b-41d4-a716-446655440003","name":"Peter Weber"}')
ON CONFLICT (id) DO NOTHING;
