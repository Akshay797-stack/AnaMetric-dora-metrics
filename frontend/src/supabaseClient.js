import { createClient } from "@supabase/supabase-js";

// Get these from your Supabase project settings
const SUPABASE_URL = "https://swkpiaenpgvykknnxuxl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3a3BpYWVucGd2eWtrbm54dXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDE2NDcsImV4cCI6MjA3MDcxNzY0N30.suVzCKBXWmPSxwZrLDVcjtgWP8tWRT291a7v42-ak4U";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
