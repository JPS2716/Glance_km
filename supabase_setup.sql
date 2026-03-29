-- Go to your Supabase Project Dashboard -> SQL Editor and run this:

-- 1. Create a table to store user activity history
CREATE TABLE public.activity_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    upload_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    inference_time DECIMAL(10, 4),
    total_detections INTEGER,
    output_url TEXT
);

-- 2. Turn on Row Level Security (RLS) for the activity_history table
ALTER TABLE public.activity_history ENABLE ROW LEVEL SECURITY;

-- 3. Create a policy so users can only insert their own activity
CREATE POLICY "Users can insert their own activity" 
ON public.activity_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Create a policy so users can only select (view) their own activity
CREATE POLICY "Users can view their own activity" 
ON public.activity_history FOR SELECT 
USING (auth.uid() = user_id);
