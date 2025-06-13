import { NextRequest, NextResponse } from 'next/server'

interface VerificationRequest {
  platform: 'xbox' | 'playstation'
  tag: string
}

interface VerificationResult {
  success: boolean
  verified: boolean
  data?: {
    id: string
    displayName: string
    avatar?: string
    platform: string
  }
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const { platform, tag }: VerificationRequest = await request.json()

    if (!platform || !tag) {
      return NextResponse.json(
        { error: 'Platform and tag are required' },
        { status: 400 }
      )
    }

    let result: VerificationResult

    switch (platform) {
      case 'xbox':
        result = await verifyXboxGamertag(tag)
        break
      case 'playstation':
        result = await verifyPlaystationId(tag)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid platform' },
          { status: 400 }
        )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Gaming tag verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function verifyXboxGamertag(gamertag: string): Promise<VerificationResult> {
  try {
    // Basic validation
    if (!isValidXboxGamertag(gamertag)) {
      return {
        success: false,
        verified: false,
        error: 'Invalid Xbox Gamertag format'
      }
    }

    // Mock successful verification for development
    // In production, integrate with Xbox Live API
    return {
      success: true,
      verified: true,
      data: {
        id: `xbox_${Date.now()}`,
        displayName: gamertag,
        platform: 'xbox'
      }
    }
  } catch (error: any) {
    console.error('Xbox verification error:', error)
    return {
      success: false,
      verified: false,
      error: 'Xbox verification failed'
    }
  }
}

async function verifyPlaystationId(psnId: string): Promise<VerificationResult> {
  try {
    // Basic validation
    if (!isValidPlaystationId(psnId)) {
      return {
        success: false,
        verified: false,
        error: 'Invalid PlayStation ID format'
      }
    }

    // Mock successful verification for development
    return {
      success: true,
      verified: true,
      data: {
        id: `psn_${Date.now()}`,
        displayName: psnId,
        platform: 'playstation'
      }
    }
  } catch (error: any) {
    console.error('PlayStation verification error:', error)
    return {
      success: false,
      verified: false,
      error: 'PlayStation verification failed'
    }
  }
}

function isValidXboxGamertag(gamertag: string): boolean {
  // Xbox Gamertag validation rules:
  // - 3-15 characters
  // - Letters, numbers, spaces (not at start/end)
  // - No consecutive spaces
  // - No special characters except space
  
  if (!gamertag || gamertag.length < 3 || gamertag.length > 15) {
    return false
  }
  
  // Check for invalid characters
  if (!/^[a-zA-Z0-9 ]+$/.test(gamertag)) {
    return false
  }
  
  // Check for spaces at start/end
  if (gamertag.startsWith(' ') || gamertag.endsWith(' ')) {
    return false
  }
  
  // Check for consecutive spaces
  if (gamertag.includes('  ')) {
    return false
  }
  
  return true
}

function isValidPlaystationId(psnId: string): boolean {
  // PlayStation ID validation rules:
  // - 3-16 characters
  // - Letters, numbers, hyphens, underscores
  // - Must start with a letter
  // - No consecutive special characters
  
  if (!psnId || psnId.length < 3 || psnId.length > 16) {
    return false
  }
  
  // Must start with a letter
  if (!/^[a-zA-Z]/.test(psnId)) {
    return false
  }
  
  // Only allowed characters
  if (!/^[a-zA-Z0-9_-]+$/.test(psnId)) {
    return false
  }
  
  // No consecutive special characters
  if (/[_-]{2,}/.test(psnId)) {
    return false
  }
  
  return true
} 
