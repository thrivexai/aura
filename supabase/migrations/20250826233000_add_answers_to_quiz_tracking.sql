-- Add answers column to quiz_tracking table
ALTER TABLE public.quiz_tracking 
ADD COLUMN answers jsonb;

-- Add a comment to document the column
COMMENT ON COLUMN public.quiz_tracking.answers IS 'Stores user quiz answers in JSON format';

-- Create an index for better query performance on the answers column
CREATE INDEX IF NOT EXISTS idx_quiz_tracking_answers ON public.quiz_tracking USING GIN (answers);
