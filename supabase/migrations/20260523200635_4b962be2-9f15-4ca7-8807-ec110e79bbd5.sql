-- Explicit owner-scoped UPDATE policy on chat_messages
CREATE POLICY "own msg update"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Explicit owner-scoped SELECT policy on newsletter_subscribers (authenticated only)
CREATE POLICY "own subscription select"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (user_id IS NOT NULL AND auth.uid() = user_id);
