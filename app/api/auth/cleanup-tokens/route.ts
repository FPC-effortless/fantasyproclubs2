import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Delete expired tokens
    const { error, count } = await supabase
      .from('email_verification_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Error cleaning up expired tokens:', error);
      return NextResponse.json(
        { error: 'Failed to clean up expired tokens' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${count || 0} expired verification tokens`,
      deletedCount: count || 0
    });

  } catch (error) {
    console.error('Token cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also allow GET requests for easier testing/monitoring
export async function GET(request: NextRequest) {
  return POST(request);
} 