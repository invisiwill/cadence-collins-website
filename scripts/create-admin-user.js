#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

async function createAdminUser() {
  // Get credentials from environment or use defaults
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const email = process.env.ADMIN_EMAIL || 'admin@cadencecollins.com';
  const fullName = process.env.ADMIN_FULL_NAME || 'Admin User';

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing Supabase configuration. Please check your environment variables.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Hash the password
    console.log('Hashing password...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Check if admin user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('admin_users')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      console.log(`Admin user '${username}' already exists. Updating password...`);
      
      // Update existing user's password
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({ 
          password_hash: passwordHash,
          email: email,
          full_name: fullName,
          is_active: true
        })
        .eq('username', username);

      if (updateError) {
        console.error('Error updating admin user:', updateError);
        process.exit(1);
      }

      console.log(`Admin user '${username}' updated successfully!`);
    } else {
      // Create new admin user
      console.log('Creating admin user...');
      const { data, error } = await supabase
        .from('admin_users')
        .insert([
          {
            username: username,
            email: email,
            full_name: fullName,
            password_hash: passwordHash,
            is_active: true
          }
        ])
        .select();

      if (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
      }

      console.log(`Admin user '${username}' created successfully!`);
    }

    console.log('\nLogin credentials:');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log(`Email: ${email}`);
    console.log('\nYou can now login to the admin panel at /admin/login');

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

createAdminUser();