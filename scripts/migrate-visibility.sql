-- Migration script to add visibility and review fields
-- Run this after updating the database schema

-- Add visibility column with default 'private'
ALTER TABLE content_submissions ADD COLUMN IF NOT EXISTS visibility VARCHAR(10) NOT NULL DEFAULT 'private';

-- Add review-related columns
ALTER TABLE content_submissions ADD COLUMN IF NOT EXISTS mod_verdict VARCHAR(20);
ALTER TABLE content_submissions ADD COLUMN IF NOT EXISTS mod_score DECIMAL(3,2);
ALTER TABLE content_submissions ADD COLUMN IF NOT EXISTS unsafe_reasons TEXT[] DEFAULT '{}';
ALTER TABLE content_submissions ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE content_submissions ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE content_submissions ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id);
ALTER TABLE content_submissions ADD COLUMN IF NOT EXISTS review_note TEXT;

-- Update existing data: set approved submissions to public
UPDATE content_submissions 
SET visibility = 'public' 
WHERE status = 'approved';

-- Update status values to match new schema
UPDATE content_submissions 
SET status = 'pending_review' 
WHERE status = 'pending_approval';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_submissions_visibility ON content_submissions(visibility);
CREATE INDEX IF NOT EXISTS idx_content_submissions_approved_at ON content_submissions(approved_at);

-- Update views to use new schema
DROP VIEW IF EXISTS user_submission_stats;
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

DROP VIEW IF EXISTS company_analytics;
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
