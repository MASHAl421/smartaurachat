
-- Feedback table
CREATE TABLE public.message_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating text NOT NULL CHECK (rating IN ('up','down')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id)
);

ALTER TABLE public.message_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own feedback select" ON public.message_feedback
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own feedback insert" ON public.message_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own feedback update" ON public.message_feedback
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own feedback delete" ON public.message_feedback
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER message_feedback_touch
  BEFORE UPDATE ON public.message_feedback
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Chat attachments read public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-attachments');

CREATE POLICY "Chat attachments user upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Chat attachments user update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'chat-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Chat attachments user delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'chat-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
