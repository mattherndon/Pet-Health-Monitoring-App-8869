import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lvnaloakfwckpwxkunmi.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bmFsb2FrZndja3B3eGt1bm1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTY5MzcsImV4cCI6MjA2NzY3MjkzN30.VZFrqhsOiuFpFoo5hDu7q9LDVbPrVVTpRQwOXY5H3Js'

if(SUPABASE_URL == 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY == '<ANON_KEY>' ){
  throw new Error('Missing Supabase variables');
}

export default createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})