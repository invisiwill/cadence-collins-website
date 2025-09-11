#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

async function debugAdminUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase configuration');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('Checking admin users table...');
    
    // Try to get all admin users
    const { data: users, error } = await supabase
      .from('admin_users')
      .select('id, username, email, full_name, is_active, created_at');

    if (error) {
      console.error('Error querying admin_users:', error);
      
      // Check if table exists
      console.log('\nChecking if admin_users table exists...');
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'admin_users');
        
      if (tablesError) {
        console.error('Error checking tables:', tablesError);
      } else if (tables.length === 0) {
        console.log('❌ admin_users table does not exist');
      } else {
        console.log('✅ admin_users table exists');
      }
    } else {
      console.log('✅ Successfully queried admin_users table');
      console.log(`Found ${users.length} admin users:`);
      users.forEach(user => {
        console.log(`- ${user.username} (${user.email}) - Active: ${user.is_active}`);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

debugAdminUser();