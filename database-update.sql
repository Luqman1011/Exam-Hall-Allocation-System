-- Enhanced Exam Hall Allocation System - Database Updates
-- Run this script to add new fields for enhanced features

-- Add bench_position column to allocations table
ALTER TABLE allocations 
ADD COLUMN IF NOT EXISTS bench_position INT DEFAULT 1;

-- Add bench_capacity column to halls table
ALTER TABLE halls 
ADD COLUMN IF NOT EXISTS bench_capacity INT DEFAULT 1;

-- Create index for faster seat map queries
CREATE INDEX IF NOT EXISTS idx_allocations_exam_hall 
ON allocations(exam_id, hall_id);

CREATE INDEX IF NOT EXISTS idx_allocations_position 
ON allocations(row_number, column_number);

-- Update existing halls with bench_capacity if not set
UPDATE halls SET bench_capacity = 1 WHERE bench_capacity IS NULL;

-- Display success message
SELECT 'Database updated successfully with enhanced features!' as message;
