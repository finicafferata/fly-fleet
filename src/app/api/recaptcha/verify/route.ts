import { NextRequest, NextResponse } from 'next/server';
import { recaptchaService, RecaptchaResult } from '../../../../lib/recaptcha/RecaptchaService';

// Validation schema (manual validation due to earlier zod issues)
interface VerifyRequestBody {
  token: string;
  action: string;
}

// Get client IP address
const getClientIP = (req: NextRequest): string => {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
};

// Validate request body
const validateRequest = (body: any): { valid: boolean; error?: string; data?: VerifyRequestBody } => {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  if (!body.token || typeof body.token !== 'string' || body.token.length === 0) {
    return { valid: false, error: 'Token is required and must be a non-empty string' };
  }

  if (!body.action || typeof body.action !== 'string' || body.action.length === 0) {
    return { valid: false, error: 'Action is required and must be a non-empty string' };
  }

  return {
    valid: true,
    data: {
      token: body.token,
      action: body.action
    }
  };
};

export async function POST(req: NextRequest) {
  try {
    let body;

    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { token, action } = validation.data!;
    const clientIP = getClientIP(req);

    // Verify reCAPTCHA token
    const result: RecaptchaResult = await recaptchaService.verifyToken(
      token,
      action,
      clientIP
    );

    // Return result
    return NextResponse.json({
      success: result.success,
      score: result.score,
      action: result.action,
      hostname: result.hostname,
      fromCache: result.fromCache,
      errors: result.errors,
      metadata: {
        clientIP,
        timestamp: new Date().toISOString(),
        serviceStatus: recaptchaService.getStatus()
      }
    });

  } catch (error) {
    console.error('reCAPTCHA verification API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const status = recaptchaService.getStatus();

    return NextResponse.json({
      status: 'healthy',
      configured: status.configured,
      developmentMode: status.developmentMode,
      scoreThreshold: status.scoreThreshold,
      cache: status.cacheStats
    });

  } catch (error) {
    console.error('reCAPTCHA status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}