-- Brand Safe Content Rewards Database Schema
-- This schema supports the Whop integration and content rewards system

-- Users table (linked to Whop users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whop_user_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(20) NOT NULL CHECK (role IN ('member', 'owner', 'admin')),
    permissions TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies/Communities table (linked to Whop companies)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whop_company_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Rewards table
CREATE TABLE content_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cpm DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    total_views BIGINT DEFAULT 0,
    total_paid DECIMAL(12,2) DEFAULT 0.00,
    approved_submissions INTEGER DEFAULT 0,
    total_submissions INTEGER DEFAULT 0,
    effective_cpm DECIMAL(10,2) DEFAULT 0.00,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Submissions table
CREATE TABLE content_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_reward_id UUID REFERENCES content_rewards(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    private_video_link TEXT NOT NULL,
    public_video_link TEXT,
    thumbnail_url TEXT,
    platform VARCHAR(50) NOT NULL DEFAULT 'youtube',
    status VARCHAR(20) NOT NULL DEFAULT 'pending_review' 
        CHECK (status IN ('pending_review', 'approved', 'rejected', 'flagged', 'published')),
    visibility VARCHAR(10) NOT NULL DEFAULT 'private' 
        CHECK (visibility IN ('private', 'public')),
    mod_verdict VARCHAR(20),
    mod_score DECIMAL(3,2),
    unsafe_reasons TEXT[] DEFAULT '{}',
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    review_note TEXT,
    paid BOOLEAN DEFAULT FALSE,
    views BIGINT DEFAULT 0,
    likes BIGINT DEFAULT 0,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Member Statistics table (for analytics and exports)
CREATE TABLE member_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    total_members INTEGER NOT NULL DEFAULT 0,
    active_members INTEGER NOT NULL DEFAULT 0,
    new_members INTEGER NOT NULL DEFAULT 0,
    member_engagement DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    total_submissions INTEGER NOT NULL DEFAULT 0,
    approved_content INTEGER NOT NULL DEFAULT 0,
    rejected_content INTEGER NOT NULL DEFAULT 0,
    pending_review INTEGER NOT NULL DEFAULT 0,
    total_rewards_given INTEGER NOT NULL DEFAULT 0,
    average_reward DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Top Contributors table (for leaderboards)
CREATE TABLE top_contributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submissions INTEGER NOT NULL DEFAULT 0,
    approved_content INTEGER NOT NULL DEFAULT 0,
    total_earnings DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    engagement_score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Top Earners table
CREATE TABLE top_earners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_earnings DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Events table (for tracking user interactions)
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Export History table (for tracking data exports)
CREATE TABLE export_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    export_type VARCHAR(50) NOT NULL,
    format VARCHAR(10) NOT NULL CHECK (format IN ('csv', 'excel')),
    date_range_start TIMESTAMP WITH TIME ZONE,
    date_range_end TIMESTAMP WITH TIME ZONE,
    file_size_bytes BIGINT,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_whop_user_id ON users(whop_user_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_companies_whop_company_id ON companies(whop_company_id);
CREATE INDEX idx_content_rewards_company_id ON content_rewards(company_id);
CREATE INDEX idx_content_rewards_status ON content_rewards(status);
CREATE INDEX idx_content_submissions_user_id ON content_submissions(user_id);
CREATE INDEX idx_content_submissions_status ON content_submissions(status);
CREATE INDEX idx_content_submissions_visibility ON content_submissions(visibility);
CREATE INDEX idx_content_submissions_submission_date ON content_submissions(submission_date);
CREATE INDEX idx_content_submissions_approved_at ON content_submissions(approved_at);
CREATE INDEX idx_member_statistics_company_id ON member_statistics(company_id);
CREATE INDEX idx_member_statistics_recorded_at ON member_statistics(recorded_at);
CREATE INDEX idx_top_contributors_company_id ON top_contributors(company_id);
CREATE INDEX idx_top_contributors_period ON top_contributors(period_start, period_end);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_company_id ON analytics_events(company_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_export_history_user_id ON export_history(user_id);
CREATE INDEX idx_export_history_company_id ON export_history(company_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_rewards_updated_at BEFORE UPDATE ON content_rewards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_submissions_updated_at BEFORE UPDATE ON content_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_top_contributors_updated_at BEFORE UPDATE ON top_contributors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_top_earners_updated_at BEFORE UPDATE ON top_earners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO companies (whop_company_id, name, description) VALUES 
('whop-company-1', 'Demo Brand Community', 'A sample community for testing brand-safe content approval');

INSERT INTO users (whop_user_id, username, email, display_name, role, permissions) VALUES 
('whop-user-1', 'demo_owner', 'owner@example.com', 'Demo Owner', 'owner', 
 ARRAY['read_content', 'write_content', 'read_analytics', 'member:stats:export', 'admin']),
('whop-user-2', 'demo_member', 'member@example.com', 'Demo Member', 'member',
 ARRAY['read_content', 'write_content', 'read_analytics']);

INSERT INTO content_rewards (company_id, name, description, cpm, created_by) VALUES 
((SELECT id FROM companies WHERE whop_company_id = 'whop-company-1'),
 'Make videos different coaching businesses you can start',
 'Create content about coaching business opportunities',
 4.00,
 (SELECT id FROM users WHERE whop_user_id = 'whop-user-1'));

-- Sample content submission with new schema
INSERT INTO content_submissions (user_id, content_reward_id, title, description, private_video_link, platform, status, visibility) VALUES 
((SELECT id FROM users WHERE whop_user_id = 'whop-user-2'),
 (SELECT id FROM content_rewards WHERE name = 'Make videos different coaching businesses you can start'),
 'Sample Coaching Business Video',
 'A demo video about starting a coaching business',
 'https://youtube.com/watch?v=demo123',
 'youtube',
 'pending_review',
 'private');

-- Views for common queries
CREATE VIEW user_submission_stats AS
SELECT 
    u.id as user_id,
    u.username,
    u.display_name,
    COUNT(cs.id) as total_submissions,
    COUNT(CASE WHEN cs.status = 'approved' AND cs.visibility = 'public' THEN 1 END) as approved_submissions,
    COUNT(CASE WHEN cs.status = 'rejected' THEN 1 END) as rejected_submissions,
    COUNT(CASE WHEN cs.status = 'pending_review' THEN 1 END) as pending_submissions,
    COUNT(CASE WHEN cs.status = 'flagged' THEN 1 END) as flagged_submissions,
    SUM(CASE WHEN cs.visibility = 'public' THEN cs.views ELSE 0 END) as total_views,
    SUM(CASE WHEN cs.visibility = 'public' THEN cs.likes ELSE 0 END) as total_likes
FROM users u
LEFT JOIN content_submissions cs ON u.id = cs.user_id
GROUP BY u.id, u.username, u.display_name;

CREATE VIEW company_analytics AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(DISTINCT u.id) as total_members,
    COUNT(DISTINCT cs.user_id) as active_creators,
    COUNT(cs.id) as total_submissions,
    COUNT(CASE WHEN cs.status = 'approved' AND cs.visibility = 'public' THEN 1 END) as approved_content,
    COUNT(CASE WHEN cs.status = 'rejected' THEN 1 END) as rejected_content,
    COUNT(CASE WHEN cs.status = 'pending_review' THEN 1 END) as pending_content,
    COUNT(CASE WHEN cs.status = 'flagged' THEN 1 END) as flagged_content,
    SUM(CASE WHEN cs.visibility = 'public' THEN cs.views ELSE 0 END) as total_views,
    AVG(cr.cpm) as average_cpm
FROM companies c
LEFT JOIN users u ON u.role = 'member'
LEFT JOIN content_submissions cs ON cs.user_id = u.id
LEFT JOIN content_rewards cr ON cr.company_id = c.id
GROUP BY c.id, c.name;
