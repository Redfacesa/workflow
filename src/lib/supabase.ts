import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://ehpvjpjinzezvnbkmvkx.supabase.co';
const supabaseKey = 'sb_publishable_-E-hwnc9ZQjVxRrMZHaJ_Q_QARjrn4d';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };