import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export async function GET() {
  try {
    const supabaseAdmin = createAdminClient();
    
    // Fetch users (Requires Service Role Key)
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) throw error;
    
    // Filter only those with role 'sharer' or those without a role (assuming default is sharer)
    const sharers = users.filter(user => user.user_metadata?.role === 'sharer' || !user.user_metadata?.role);

    return NextResponse.json(sharers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { userId, fakeCreatedAt, fakeLastSignedAt } = body;
    
    const supabaseAdmin = createAdminClient();
    
    // Fetch existing metadata to preserve other fields
    const { data: { user }, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (fetchError) throw fetchError;

    const currentMetadata = user.user_metadata || {};
    
    // Update user root fields for timestamp manipulation
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { 
        user_metadata: {
          ...currentMetadata,
          fakeCreatedAt,
          fakeLastSignedAt
        }
      }
    );
    
    if (error) throw error;
    
    return NextResponse.json(data.user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
