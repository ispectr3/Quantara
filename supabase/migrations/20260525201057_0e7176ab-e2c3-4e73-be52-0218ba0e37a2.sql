DROP POLICY IF EXISTS "Public can subscribe with valid email" ON public.newsletter_subscribers;

CREATE POLICY "Anon can subscribe without user_id"
ON public.newsletter_subscribers
FOR INSERT
TO anon
WITH CHECK (
  char_length(email) BETWEEN 3 AND 320
  AND position('@' in email) > 1
  AND user_id IS NULL
);

CREATE POLICY "Authenticated can subscribe as themselves"
ON public.newsletter_subscribers
FOR INSERT
TO authenticated
WITH CHECK (
  char_length(email) BETWEEN 3 AND 320
  AND position('@' in email) > 1
  AND user_id = auth.uid()
);