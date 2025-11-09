-- Supabase Database Setup for FoodExpress Driver Dashboard

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    vehicle_type VARCHAR(50) NOT NULL,
    working_area VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'offline',
    rating DECIMAL(3,2) DEFAULT 5.0,
    total_deliveries INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    last_location_update TIMESTAMP WITH TIME ZONE,
    last_online TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id VARCHAR(255) NOT NULL,
    restaurant_name VARCHAR(255) NOT NULL,
    restaurant_address TEXT NOT NULL,
    restaurant_lat DECIMAL(10,8),
    restaurant_lng DECIMAL(11,8),
    customer_id VARCHAR(255),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    delivery_address TEXT NOT NULL,
    delivery_lat DECIMAL(10,8),
    delivery_lng DECIMAL(11,8),
    items JSONB,
    subtotal DECIMAL(10,2) DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 4.99,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    special_instructions TEXT,
    driver_id UUID REFERENCES drivers(id),
    driver_name VARCHAR(255),
    assigned_at TIMESTAMP WITH TIME ZONE,
    picked_up_at TIMESTAMP WITH TIME ZONE,
    delivery_started_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    customer_rating INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Driver earnings table (for detailed tracking)
CREATE TABLE IF NOT EXISTS driver_earnings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    driver_id UUID REFERENCES drivers(id) NOT NULL,
    order_id UUID REFERENCES orders(id) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(50) DEFAULT 'delivery_fee',
    status VARCHAR(20) DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_drivers_phone ON drivers(phone);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_driver_id ON orders(driver_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_driver_earnings_driver_id ON driver_earnings(driver_id);

-- Enable Row Level Security (RLS)
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Simplified for demo

-- Drivers can read all driver data (simplified for demo)
CREATE POLICY "Drivers can view driver data" ON drivers
    FOR SELECT USING (true);

-- Drivers can update their own data (simplified)
CREATE POLICY "Drivers can update driver data" ON drivers
    FOR UPDATE USING (true);

-- Anyone can view orders (simplified for demo)
CREATE POLICY "Anyone can view orders" ON orders
    FOR SELECT USING (true);

-- Drivers can update orders
CREATE POLICY "Drivers can update orders" ON orders
    FOR UPDATE USING (true);

-- Drivers can view earnings
CREATE POLICY "Drivers can view earnings" ON driver_earnings
    FOR SELECT USING (true);

-- Insert sample data for testing
INSERT INTO drivers (id, name, phone, vehicle_type, working_area, status, rating, total_deliveries, total_earnings) VALUES
    ('11111111-1111-1111-1111-111111111111', 'John Driver', '5551234567', 'car', 'Downtown, Midtown', 'online', 4.8, 47, 235.50),
    ('22222222-2222-2222-2222-222222222222', 'Sarah Wilson', '5552345678', 'motorcycle', 'Uptown, Westside', 'offline', 4.9, 32, 160.25),
    ('33333333-3333-3333-3333-333333333333', 'Mike Johnson', '5553456789', 'bicycle', 'Downtown, Eastside', 'online', 4.7, 28, 140.75);

INSERT INTO orders (id, restaurant_name, restaurant_address, customer_name, delivery_address, items, total, status, driver_id) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mario''s Italian Kitchen', '123 Main St, Downtown', 'Alice Brown', '456 Oak Ave, Midtown', '[{"name": "Margherita Pizza", "price": 18.99, "quantity": 1}, {"name": "Caesar Salad", "price": 12.99, "quantity": 1}]', 36.47, 'assigned', '11111111-1111-1111-1111-111111111111'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Dragon Palace', '456 Oak Ave, Chinatown', 'Bob Smith', '789 Pine St, Uptown', '[{"name": "Kung Pao Chicken", "price": 15.99, "quantity": 2}, {"name": "Spring Rolls", "price": 7.99, "quantity": 1}]', 45.46, 'pending', NULL),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Burger Junction', '321 Elm St, Uptown', 'Carol Davis', '654 Maple Blvd, Westside', '[{"name": "Classic Cheeseburger", "price": 12.99, "quantity": 1}, {"name": "Sweet Potato Fries", "price": 6.99, "quantity": 1}]', 24.47, 'picked_up', '22222222-2222-2222-2222-222222222222'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Sakura Sushi', '654 Maple Blvd, Little Tokyo', 'David Wilson', '987 Cedar Ln, Eastside', '[{"name": "California Roll", "price": 10.99, "quantity": 2}, {"name": "Miso Soup", "price": 4.99, "quantity": 2}]', 36.46, 'pending', NULL);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update driver stats
CREATE OR REPLACE FUNCTION update_driver_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        -- Update driver's total deliveries and earnings
        UPDATE drivers 
        SET 
            total_deliveries = COALESCE(total_deliveries, 0) + 1,
            total_earnings = COALESCE(total_earnings, 0) + COALESCE(NEW.delivery_fee, 4.99),
            updated_at = NOW()
        WHERE id = NEW.driver_id;
        
        -- Insert into driver_earnings table
        INSERT INTO driver_earnings (driver_id, order_id, amount, type, status)
        VALUES (NEW.driver_id, NEW.id, COALESCE(NEW.delivery_fee, 4.99), 'delivery_fee', 'completed');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for driver stats
CREATE TRIGGER update_driver_stats_trigger 
    AFTER UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_driver_stats();
