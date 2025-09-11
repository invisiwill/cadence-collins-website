-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE 
        CHECK (length(trim(username)) > 0 AND length(username) <= 50),
    email VARCHAR(255) NOT NULL UNIQUE 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    full_name VARCHAR(100) NOT NULL 
        CHECK (length(trim(full_name)) > 0 AND length(full_name) <= 100),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Mailing list subscribers table
CREATE TABLE mailing_list_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    name VARCHAR(100) NOT NULL 
        CHECK (length(trim(name)) > 0 AND length(name) <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Campaign events table  
CREATE TABLE campaign_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL 
        CHECK (length(trim(title)) > 0 AND length(title) <= 200),
    description TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL 
        CHECK (date >= NOW() - INTERVAL '30 days'),
    location VARCHAR(300) NOT NULL 
        CHECK (length(trim(location)) > 0 AND length(location) <= 300),
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Content blocks table
CREATE TABLE content_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key VARCHAR(50) NOT NULL UNIQUE 
        CHECK (section_key IN ('bio', 'policy', 'contact')),
    title VARCHAR(200) NOT NULL 
        CHECK (length(trim(title)) > 0 AND length(title) <= 200),
    content TEXT NOT NULL 
        CHECK (length(content) <= 10000),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_mailing_list_email ON mailing_list_subscribers(email);
CREATE INDEX idx_mailing_list_created_at ON mailing_list_subscribers(created_at);
CREATE INDEX idx_campaign_events_date ON campaign_events(date);  
CREATE INDEX idx_campaign_events_published ON campaign_events(is_published);
CREATE INDEX idx_content_block_section ON content_blocks(section_key);

-- Update timestamp trigger for events
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaign_events_updated_at 
    BEFORE UPDATE ON campaign_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_blocks_updated_at 
    BEFORE UPDATE ON content_blocks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample content blocks
INSERT INTO content_blocks (section_key, title, content) VALUES 
('bio', 'About Cadence Collins', 'Cadence Collins is a dedicated community member running for school board to ensure every child receives a quality education. With a background in education policy and community organizing, she brings fresh perspectives and practical solutions to our schools.'),
('policy', 'Policy Priorities', '• Increase teacher support and resources\n• Improve school safety and infrastructure\n• Expand access to arts and STEM programs\n• Enhance parent and community engagement\n• Ensure fiscal responsibility and transparency'),
('contact', 'Get in Touch', 'Ready to support our campaign? Join our mailing list for updates and volunteer opportunities. Together, we can build better schools for our community.'); 