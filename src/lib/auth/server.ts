import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

/**
 * Get authenticated session for admin routes
 * Returns session if user is authenticated and has admin role
 */
export async function getAuthSession() {
  const session = await getServerSession(authOptions);
  return session;
}

/**
 * Check if user is authenticated as admin
 * Returns true if authenticated with admin role, false otherwise
 */
export async function isAdmin() {
  const session = await getAuthSession();
  return session?.user?.role === 'admin';
}

/**
 * Protect admin routes - use this in API route handlers
 * Returns an error response if user is not authenticated
 * Returns null if user is authenticated (proceed with route logic)
 */
export async function requireAdmin() {
  const session = await getAuthSession();

  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  return null;
}
