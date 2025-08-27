-- Add missing columns to quiz_tracking table
ALTER TABLE public.quiz_tracking 
ADD COLUMN IF NOT EXISTS answers jsonb,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add a comment to document the columns
COMMENT ON COLUMN public.quiz_tracking.answers IS 'Stores user quiz answers in JSON format';
COMMENT ON COLUMN public.quiz_tracking.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN public.quiz_tracking.updated_at IS 'Timestamp when the record was last updated';

-- Create an index for better query performance on the answers column
CREATE INDEX IF NOT EXISTS idx_quiz_tracking_answers ON public.quiz_tracking USING GIN (answers);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to the table
DROP TRIGGER IF EXISTS update_quiz_tracking_updated_at ON public.quiz_tracking;
CREATE TRIGGER update_quiz_tracking_updated_at
BEFORE UPDATE ON public.quiz_tracking
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
