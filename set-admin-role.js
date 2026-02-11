/**
 * Script to set admin role for a Clerk user
 * Run with: node set-admin-role.js
 */

require('dotenv').config({ path: '.env.local' });

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
const CLERK_API_BASE = 'https://api.clerk.com/v1';

async function setAdminRole() {
  try {
    console.log('🔍 Fetching users from Clerk...\n');

    // Fetch all users
    const usersResponse = await fetch(`${CLERK_API_BASE}/users`, {
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!usersResponse.ok) {
      throw new Error(`Failed to fetch users: ${usersResponse.statusText}`);
    }

    const users = await usersResponse.json();

    if (!users || users.length === 0) {
      console.log('❌ No users found in Clerk.');
      return;
    }

    // Display all users
    console.log(`Found ${users.length} user(s):\n`);
    users.forEach((user, index) => {
      const email = user.email_addresses?.[0]?.email_address || 'No email';
      const firstName = user.first_name || '';
      const lastName = user.last_name || '';
      const name = `${firstName} ${lastName}`.trim() || 'No name';
      const currentRole = user.public_metadata?.role || 'none';

      console.log(`${index + 1}. ${name} (${email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Current role: ${currentRole}`);
      console.log('');
    });

    // If only one user, auto-select it
    let selectedUser;
    if (users.length === 1) {
      selectedUser = users[0];
      console.log(`✅ Auto-selecting the only user: ${selectedUser.email_addresses[0].email_address}\n`);
    } else {
      // For multiple users, you'll need to manually set the user ID
      console.log('⚠️  Multiple users found. Please edit this script and set the USER_ID variable.');
      console.log('   Example: const USER_ID = "user_xxxxxxxxxxxxx";\n');
      return;
    }

    // Update the user's public metadata
    console.log(`🔄 Setting admin role for user: ${selectedUser.id}...`);

    const updateResponse = await fetch(`${CLERK_API_BASE}/users/${selectedUser.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_metadata: {
          ...selectedUser.public_metadata,
          role: 'admin',
        },
      }),
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.text();
      throw new Error(`Failed to update user: ${updateResponse.statusText} - ${errorData}`);
    }

    const updatedUser = await updateResponse.json();

    console.log('\n✅ SUCCESS! Admin role has been set.');
    console.log(`\n👤 Updated user:`);
    console.log(`   Name: ${updatedUser.first_name} ${updatedUser.last_name}`);
    console.log(`   Email: ${updatedUser.email_addresses[0].email_address}`);
    console.log(`   Role: ${updatedUser.public_metadata.role}`);
    console.log('\n🎉 You can now access the admin panel at: http://localhost:3000/admin');
    console.log('\n⚠️  Note: You may need to sign out and sign back in for the changes to take effect.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
setAdminRole();
