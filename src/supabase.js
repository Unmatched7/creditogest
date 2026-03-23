import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fsevkaepszbekryhutes.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzZXZrYWVwc3piZWtyeWh1dGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMzA4ODUsImV4cCI6MjA4OTgwNjg4NX0.J8iY8h19WbrjOYQU11cbps6TXaqFPhh2RZ6Dl1aWuMc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
