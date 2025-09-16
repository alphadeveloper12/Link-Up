# Admin Access Guide

## Overview
The admin panel is secured with role-based access control using the Supabase database. Only users with admin privileges can access administrative features.

## Security Features
- **Database-driven authorization**: Admin status is stored in the `admin_users` table
- **Row Level Security (RLS)**: Database policies prevent unauthorized access
- **Protected routes**: Admin routes are wrapped with `AdminRoute` component
- **Real-time validation**: Admin status is checked on every request

## Admin User Management
Admins can now manage other admin users through the Admin User Management interface:

### Adding Admin Users
1. Navigate to the Admin Console (`/admin`)
2. Scroll down to the "Admin User Management" section
3. Enter the email address of the user you want to make an admin
4. Click "Add Admin"
5. The user must already be registered in the system

### Removing Admin Users
1. In the Admin User Management section, find the admin user you want to remove
2. Click the trash icon next to their name
3. Confirm the removal in the dialog
4. Note: You cannot remove yourself from admin status

### Security Notes
- Only existing admins can add/remove other admins
- Users must be registered in the system before being granted admin access
- All admin operations are logged and auditable
- Self-removal is prevented to avoid locking out all admins

## Initial Admin Setup
To create the first admin user, a developer with database access must manually insert a record:

```sql
INSERT INTO admin_users (user_id, email, role)
VALUES ('user-uuid-here', 'admin@company.com', 'admin');
```

## Access Path
1. User must be logged in
2. User must exist in the `admin_users` table
3. Navigate to `/admin` or `/admin/email-console`
4. The system will automatically verify admin status

## Database Schema
The `admin_users` table contains:
- `id`: Primary key
- `user_id`: Foreign key to auth.users
- `email`: Admin user's email
- `role`: Admin role (currently 'admin')
- `created_at`: Timestamp of when admin access was granted

## RLS Policies
- Users can only read their own admin status
- Only existing admins can manage other admin users
- All operations require authentication
5. Non-admin users see 404 for admin URLs

## Security Notes
- Admin status is checked on every page load
- Routes are protected at the component level
- Database queries use Row Level Security (RLS)
- Admin table has proper foreign key constraints

## Troubleshooting
- If admin can't access: Check `admin_users` table for active record
- If navigation doesn't show: Verify authentication and admin status
- For access issues: Check browser console for auth errors