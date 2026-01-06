import crypto from 'crypto';
import { cacheGet, cacheSet } from '@/lib/redis/client';

// reCAPTCHA verification response interface
interface RecaptchaVerificationResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

// Verification result interface for our service
export interface RecaptchaResult {
  success: boolean;
  score?: number;
  action?: string;
  hostname?: string;
  errors?: string[];
  fromCache?: boolean;
}

export class RecaptchaService {
  private secretKey: string;
  private scoreThreshold: number;
  private cacheTTL: number;
  private developmentMode: boolean;

  constructor() {
    this.secretKey = process.env.RECAPTCHA_SECRET_KEY || '';
    this.scoreThreshold = Number(process.env.RECAPTCHA_SCORE_THRESHOLD) || 0.5;
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes (kept in ms for compatibility)
    this.developmentMode = process.env.NODE_ENV === 'development' || !this.secretKey;
  }

  /**
   * Verify a reCAPTCHA token
   */
  async verifyToken(
    token: string,
    expectedAction: string,
    remoteIp?: string
  ): Promise<RecaptchaResult> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(token, expectedAction);
      const cached = await this.getFromCache(cacheKey);
      if (cached) {
        return { ...cached, fromCache: true };
      }

      // Development mode bypass
      if (this.developmentMode) {
        const devResult: RecaptchaResult = {
          success: true,
          score: 0.9,
          action: expectedAction,
          hostname: 'localhost'
        };
        await this.setCache(cacheKey, devResult);
        console.log('⚠️ Development mode: reCAPTCHA verification bypassed');
        return devResult;
      }

      // Verify with Google reCAPTCHA API
      const result = await this.verifyWithGoogle(token, remoteIp);

      // Validate the result
      const validatedResult = this.validateResult(result, expectedAction);

      // Cache successful verifications
      if (validatedResult.success) {
        await this.setCache(cacheKey, validatedResult);
      }

      // Log suspicious attempts
      if (!validatedResult.success || (validatedResult.score && validatedResult.score < 0.3)) {
        this.logSuspiciousAttempt(token, result, remoteIp);
      }

      return validatedResult;

    } catch (error) {
      console.error('reCAPTCHA verification error:', error);

      // Fallback for service unavailability
      return this.getFallbackResult(expectedAction);
    }
  }

  /**
   * Verify token with Google reCAPTCHA API
   */
  private async verifyWithGoogle(
    token: string,
    remoteIp?: string
  ): Promise<RecaptchaVerificationResponse> {
    const params = new URLSearchParams({
      secret: this.secretKey,
      response: token
    });

    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000) // 10 seconds
    });

    if (!response.ok) {
      throw new Error(`reCAPTCHA API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Validate the reCAPTCHA result against our criteria
   */
  private validateResult(
    response: RecaptchaVerificationResponse,
    expectedAction: string
  ): RecaptchaResult {
    const result: RecaptchaResult = {
      success: false,
      score: response.score,
      action: response.action,
      hostname: response.hostname,
      errors: response['error-codes']
    };

    // Check basic success
    if (!response.success) {
      return result;
    }

    // Check action matches (for reCAPTCHA v3)
    if (response.action && response.action !== expectedAction) {
      result.errors = [`Action mismatch: expected '${expectedAction}', got '${response.action}'`];
      return result;
    }

    // Check score threshold (for reCAPTCHA v3)
    if (response.score !== undefined && response.score < this.scoreThreshold) {
      result.errors = [`Score too low: ${response.score} < ${this.scoreThreshold}`];
      return result;
    }

    // All checks passed
    result.success = true;
    return result;
  }

  /**
   * Get fallback result when service is unavailable
   */
  private getFallbackResult(expectedAction: string): RecaptchaResult {
    console.warn('🚨 reCAPTCHA service unavailable, using fallback (ALLOW)');
    return {
      success: true,
      score: undefined,
      action: expectedAction,
      hostname: undefined,
      errors: ['Service unavailable - fallback used']
    };
  }

  /**
   * Log suspicious attempts for monitoring
   */
  private logSuspiciousAttempt(
    token: string,
    response: RecaptchaVerificationResponse,
    remoteIp?: string
  ): void {
    const logData = {
      timestamp: new Date().toISOString(),
      remoteIp: remoteIp || 'unknown',
      tokenHash: crypto.createHash('sha256').update(token).digest('hex').substring(0, 16),
      score: response.score,
      action: response.action,
      hostname: response.hostname,
      errors: response['error-codes'],
      success: response.success
    };

    console.warn('🚨 Suspicious reCAPTCHA attempt:', JSON.stringify(logData));
  }

  /**
   * Generate cache key for a token and action
   */
  private generateCacheKey(token: string, action: string): string {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex').substring(0, 16);
    return `${tokenHash}_${action}`;
  }

  /**
   * Get result from cache if valid
   */
  private async getFromCache(cacheKey: string): Promise<RecaptchaResult | null> {
    return await cacheGet<RecaptchaResult>(`recaptcha:${cacheKey}`);
  }

  /**
   * Set result in cache
   */
  private async setCache(cacheKey: string, result: RecaptchaResult): Promise<void> {
    // Convert TTL from milliseconds to seconds for Redis
    const ttlSeconds = Math.floor(this.cacheTTL / 1000);
    await cacheSet(`recaptcha:${cacheKey}`, result, ttlSeconds);
  }

  /**
   * Get cache statistics for monitoring
   * Note: With Redis, detailed stats require separate analytics
   */
  getCacheStats(): { message: string; ttlSeconds: number } {
    return {
      message: 'Using Redis distributed cache',
      ttlSeconds: Math.floor(this.cacheTTL / 1000)
    };
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    return !this.developmentMode && !!this.secretKey;
  }

  /**
   * Get current configuration status
   */
  getStatus(): {
    configured: boolean;
    developmentMode: boolean;
    scoreThreshold: number;
    cacheStats: { message: string; ttlSeconds: number };
  } {
    return {
      configured: this.isConfigured(),
      developmentMode: this.developmentMode,
      scoreThreshold: this.scoreThreshold,
      cacheStats: this.getCacheStats()
    };
  }
}

// Export a singleton instance
export const recaptchaService = new RecaptchaService();