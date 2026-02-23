import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://pqtngbshwbbmgmsjetac.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImUwMmVlOWVhLWVlMzMtNDIwMy1hMjU4LTI1NjQ4YzhlZDI1OCJ9.eyJwcm9qZWN0SWQiOiJwcXRuZ2JzaHdiYm1nbXNqZXRhYyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcwNTYzNzIwLCJleHAiOjIwODU5MjM3MjAsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.HS0Yjam4GX7ASyt6cEjOklRUhDaf0V1boOuf-qdAKdo';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };