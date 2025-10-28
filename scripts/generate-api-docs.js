#!/usr/bin/env node

/**
 * Fly-Fleet API Documentation Generator
 *
 * This script automatically generates OpenAPI documentation by parsing
 * API route files and extracting schemas and metadata.
 *
 * Usage:
 *   node scripts/generate-api-docs.js
 *   npm run docs:generate
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const CONFIG = {
  apiPath: './src/app/api',
  outputFile: './openapi.yaml',
  schemaPath: './src/lib/validations',
  verbose: process.env.DOCS_VERBOSE === 'true',
  environment: process.env.NODE_ENV || 'development'
};

// Base OpenAPI specification
const BASE_SPEC = {
  openapi: '3.0.3',
  info: {
    title: 'Fly-Fleet API',
    description: 'Private Jet Charter Brokerage Platform API',
    version: '1.0.0',
    contact: {
      name: 'Fly-Fleet Support',
      email: 'contact@fly-fleet.com'
    },
    license: {
      name: 'Private'
    }
  },
  servers: getServers(),
  tags: [
    { name: 'quotes', description: 'Quote request management' },
    { name: 'contact', description: 'Contact form handling' },
    { name: 'airports', description: 'Airport search functionality' },
    { name: 'content', description: 'Content management system' },
    { name: 'faqs', description: 'FAQ management' },
    { name: 'analytics', description: 'Event tracking and analytics' },
    { name: 'whatsapp', description: 'WhatsApp integration' },
    { name: 'webhooks', description: 'External service webhooks' },
    { name: 'recaptcha', description: 'reCAPTCHA verification' },
    { name: 'seo', description: 'SEO metadata generation' },
    { name: 'admin', description: 'Administrative operations' }
  ],
  paths: {},
  components: {
    securitySchemes: {
      AdminAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Admin authentication using Bearer token with x-admin-email header'
      }
    },
    schemas: {},
    responses: getCommonResponses()
  }
};

function getServers() {
  const servers = {
    development: [
      { url: 'http://localhost:3000', description: 'Development server' }
    ],
    staging: [
      { url: 'https://staging-api.fly-fleet.com', description: 'Staging server' },
      { url: 'http://localhost:3000', description: 'Development server' }
    ],
    production: [
      { url: 'https://api.fly-fleet.com', description: 'Production server' },
      { url: 'https://staging-api.fly-fleet.com', description: 'Staging server' }
    ]
  };

  return servers[CONFIG.environment] || servers.development;
}

function getCommonResponses() {
  return {
    ValidationError: {
      description: 'Request validation failed',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              error: { type: 'string', example: 'Validation failed' },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    code: { type: 'string' },
                    path: { type: 'array', items: { oneOf: [{ type: 'string' }, { type: 'integer' }] } },
                    message: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    RateLimitError: {
      description: 'Rate limit exceeded',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              error: { type: 'string', example: 'Rate limit exceeded. Maximum 7 requests per hour.' }
            }
          }
        }
      }
    },
    UnauthorizedError: {
      description: 'Authentication required',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              error: { type: 'string', example: 'Authentication required' }
            }
          }
        }
      }
    },
    ForbiddenError: {
      description: 'Access forbidden',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              error: { type: 'string', example: 'Access forbidden' }
            }
          }
        }
      }
    },
    NotFoundError: {
      description: 'Resource not found',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              error: { type: 'string', example: 'Resource not found' }
            }
          }
        }
      }
    },
    InternalError: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              error: { type: 'string', example: 'Internal server error' }
            }
          }
        }
      }
    }
  };
}

/**
 * Parse API route files and extract endpoint information
 */
function parseApiRoutes() {
  const routes = {};

  if (!fs.existsSync(CONFIG.apiPath)) {
    console.error(`❌ API path not found: ${CONFIG.apiPath}`);
    return routes;
  }

  try {
    walkDirectory(CONFIG.apiPath, (filePath, relativePath) => {
      if (filePath.endsWith('route.ts')) {
        const routeInfo = parseRouteFile(filePath, relativePath);
        if (routeInfo) {
          const apiPath = convertFilePathToApiPath(relativePath);
          routes[apiPath] = routeInfo;

          if (CONFIG.verbose) {
            console.log(`📄 Parsed route: ${apiPath}`);
          }
        }
      }
    });
  } catch (error) {
    console.error('❌ Error parsing API routes:', error.message);
  }

  return routes;
}

/**
 * Walk directory recursively
 */
function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDirectory(filePath, callback);
    } else {
      const relativePath = path.relative(CONFIG.apiPath, filePath);
      callback(filePath, relativePath);
    }
  });
}

/**
 * Convert file path to API path
 */
function convertFilePathToApiPath(filePath) {
  let apiPath = '/' + filePath.replace(/\\/g, '/').replace('/route.ts', '');

  // Handle dynamic routes [param] -> {param}
  apiPath = apiPath.replace(/\[([^\]]+)\]/g, '{$1}');

  // Ensure it starts with /api
  if (!apiPath.startsWith('/api')) {
    apiPath = '/api' + apiPath;
  }

  return apiPath;
}

/**
 * Parse individual route file
 */
function parseRouteFile(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const routeInfo = {};

    // Extract HTTP methods
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    methods.forEach(method => {
      if (content.includes(`export async function ${method}`)) {
        routeInfo[method.toLowerCase()] = extractMethodInfo(content, method, relativePath);
      }
    });

    return Object.keys(routeInfo).length > 0 ? routeInfo : null;
  } catch (error) {
    if (CONFIG.verbose) {
      console.warn(`⚠️  Could not parse route file: ${filePath} - ${error.message}`);
    }
    return null;
  }
}

/**
 * Extract method information from route content
 */
function extractMethodInfo(content, method, relativePath) {
  const methodInfo = {
    summary: generateSummary(method, relativePath),
    description: generateDescription(method, relativePath),
    tags: inferTags(relativePath),
    responses: {
      '200': { description: 'Success' },
      '500': { $ref: '#/components/responses/InternalError' }
    }
  };

  // Add common error responses based on content analysis
  if (content.includes('validation') || content.includes('Schema.safeParse')) {
    methodInfo.responses['400'] = { $ref: '#/components/responses/ValidationError' };
  }

  if (content.includes('rate limit') || content.includes('checkRateLimit')) {
    methodInfo.responses['429'] = { $ref: '#/components/responses/RateLimitError' };
  }

  if (content.includes('admin') || content.includes('AdminAuth')) {
    methodInfo.security = [{ AdminAuth: [] }];
    methodInfo.responses['401'] = { $ref: '#/components/responses/UnauthorizedError' };
    methodInfo.responses['403'] = { $ref: '#/components/responses/ForbiddenError' };
  }

  // Extract schema information
  const requestSchema = extractRequestSchema(content);
  if (requestSchema && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    methodInfo.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: requestSchema
        }
      }
    };
  }

  // Extract query parameters
  const queryParams = extractQueryParameters(content);
  if (queryParams.length > 0) {
    methodInfo.parameters = queryParams;
  }

  // Extract path parameters
  const pathParams = extractPathParameters(relativePath);
  if (pathParams.length > 0) {
    methodInfo.parameters = (methodInfo.parameters || []).concat(pathParams);
  }

  return methodInfo;
}

/**
 * Generate summary for the endpoint
 */
function generateSummary(method, relativePath) {
  const pathParts = relativePath.split('/').filter(p => p && p !== 'route.ts');
  const resource = pathParts[0] || 'resource';

  const summaries = {
    GET: pathParts.includes('[id]') ? `Get ${resource}` : `List ${resource}`,
    POST: `Create ${resource}`,
    PUT: `Update ${resource}`,
    PATCH: `Partially update ${resource}`,
    DELETE: `Delete ${resource}`
  };

  return summaries[method] || `${method} ${resource}`;
}

/**
 * Generate description for the endpoint
 */
function generateDescription(method, relativePath) {
  const pathParts = relativePath.split('/').filter(p => p && p !== 'route.ts');
  const resource = pathParts[0] || 'resource';

  const descriptions = {
    quotes: 'Manage quote requests for private jet charter services',
    contact: 'Handle contact form submissions and inquiries',
    airports: 'Search and retrieve airport information',
    content: 'Manage CMS content with multilingual support',
    faqs: 'Manage frequently asked questions',
    analytics: 'Track user events and analytics',
    whatsapp: 'Generate WhatsApp communication links',
    webhooks: 'Handle external service webhooks',
    recaptcha: 'Verify reCAPTCHA tokens for security',
    seo: 'Generate SEO metadata for pages',
    admin: 'Administrative operations requiring authentication'
  };

  return descriptions[resource] || `${method} operation for ${resource}`;
}

/**
 * Infer tags from route path
 */
function inferTags(relativePath) {
  const pathParts = relativePath.split('/').filter(p => p && p !== 'route.ts');
  const tags = [];

  if (pathParts[0]) {
    tags.push(pathParts[0]);
  }

  if (pathParts.includes('admin')) {
    tags.push('admin');
  }

  return tags;
}

/**
 * Extract request schema from route content
 */
function extractRequestSchema(content) {
  // Look for Zod schema definitions
  const schemaMatch = content.match(/const\s+(\w+Schema)\s*=\s*z\.object\({([^}]+)}\)/s);
  if (schemaMatch) {
    return { $ref: `#/components/schemas/${schemaMatch[1]}` };
  }

  // Look for inline validation
  if (content.includes('z.object({')) {
    return {
      type: 'object',
      description: 'Request body schema (auto-detected)'
    };
  }

  return null;
}

/**
 * Extract query parameters from route content
 */
function extractQueryParameters(content) {
  const params = [];

  // Common query parameter patterns
  const paramPatterns = [
    { name: 'q', type: 'string', description: 'Search query' },
    { name: 'locale', type: 'string', enum: ['es', 'en', 'pt'], description: 'Language locale' },
    { name: 'limit', type: 'integer', description: 'Maximum number of results' },
    { name: 'offset', type: 'integer', description: 'Pagination offset' },
    { name: 'status', type: 'string', description: 'Filter by status' },
    { name: 'category', type: 'string', description: 'Filter by category' },
    { name: 'search', type: 'string', description: 'Search term' },
    { name: 'grouped', type: 'boolean', description: 'Group results' },
    { name: 'action', type: 'string', description: 'Action to perform' }
  ];

  paramPatterns.forEach(param => {
    if (content.includes(`'${param.name}'`) || content.includes(`"${param.name}"`)) {
      const paramSchema = {
        name: param.name,
        in: 'query',
        schema: {
          type: param.type
        },
        description: param.description
      };

      if (param.enum) {
        paramSchema.schema.enum = param.enum;
      }

      params.push(paramSchema);
    }
  });

  return params;
}

/**
 * Extract path parameters from route file path
 */
function extractPathParameters(relativePath) {
  const params = [];
  const matches = relativePath.match(/\[([^\]]+)\]/g);

  if (matches) {
    matches.forEach(match => {
      const paramName = match.slice(1, -1); // Remove [ and ]
      params.push({
        name: paramName,
        in: 'path',
        required: true,
        schema: {
          type: paramName === 'id' ? 'string' : 'string',
          format: paramName === 'id' ? 'uuid' : undefined
        },
        description: `${paramName.charAt(0).toUpperCase() + paramName.slice(1)} parameter`
      });
    });
  }

  return params;
}

/**
 * Generate common schemas
 */
function generateCommonSchemas() {
  return {
    Locale: {
      type: 'string',
      enum: ['es', 'en', 'pt'],
      description: 'Supported locale codes'
    },
    ServiceType: {
      type: 'string',
      enum: ['charter', 'empty_legs', 'multicity', 'helicopter', 'medical', 'cargo', 'other'],
      description: 'Type of aviation service requested'
    },
    QuoteStatus: {
      type: 'string',
      enum: ['pending', 'processing', 'quoted', 'converted', 'closed'],
      description: 'Status of a quote request'
    },
    AdditionalService: {
      type: 'string',
      enum: [
        'international_support',
        'country_documentation',
        'pet_friendly_transport',
        'ground_transfer_driver',
        'premium_catering',
        'vip_lounge_fbo',
        'customs_immigration_assist'
      ],
      description: 'Additional services that can be requested'
    },
    ContactFormSchema: {
      type: 'object',
      required: ['email', 'message', 'locale'],
      properties: {
        fullName: {
          type: 'string',
          minLength: 2,
          maxLength: 100,
          description: 'Full name of the contact (alternative to firstName/lastName)'
        },
        firstName: {
          type: 'string',
          minLength: 1,
          maxLength: 50,
          description: 'First name of the contact'
        },
        lastName: {
          type: 'string',
          minLength: 1,
          maxLength: 50,
          description: 'Last name of the contact'
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'Contact email address'
        },
        phone: {
          type: 'string',
          description: 'Contact phone number (optional)'
        },
        contactViaWhatsApp: {
          type: 'boolean',
          description: 'Preference to be contacted via WhatsApp'
        },
        subject: {
          type: 'string',
          maxLength: 200,
          description: 'Subject of the inquiry'
        },
        message: {
          type: 'string',
          minLength: 10,
          maxLength: 1000,
          description: 'Contact message content'
        },
        locale: {
          type: 'string',
          enum: ['es', 'en', 'pt'],
          description: 'Preferred language locale'
        },
        recaptchaToken: {
          type: 'string',
          description: 'reCAPTCHA verification token (optional)'
        },
        inquiryType: {
          type: 'string',
          description: 'Type of inquiry (optional)'
        }
      },
      description: 'Contact form submission schema. Requires either fullName OR both firstName and lastName.'
    },
    QuoteStatusUpdateSchema: {
      type: 'object',
      required: ['status', 'adminEmail', 'adminToken'],
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'processing', 'quoted', 'converted', 'closed'],
          description: 'New status for the quote'
        },
        adminNote: {
          type: 'string',
          maxLength: 1000,
          description: 'Optional administrative note about the status change'
        },
        adminEmail: {
          type: 'string',
          format: 'email',
          description: 'Email of the admin making the change'
        },
        adminToken: {
          type: 'string',
          minLength: 1,
          description: 'Authentication token for admin access'
        }
      },
      description: 'Schema for updating quote request status'
    }
  };
}

/**
 * Main generation function
 */
function generateDocumentation() {
  console.log('🚀 Generating Fly-Fleet API documentation...');

  const spec = { ...BASE_SPEC };

  // Parse API routes
  console.log('📁 Parsing API routes...');
  const routes = parseApiRoutes();
  spec.paths = routes;

  // Add common schemas
  console.log('📋 Adding common schemas...');
  spec.components.schemas = {
    ...spec.components.schemas,
    ...generateCommonSchemas()
  };

  // Write output file
  console.log(`📝 Writing documentation to ${CONFIG.outputFile}...`);
  try {
    const yamlContent = yaml.dump(spec, {
      lineWidth: -1,
      noRefs: true,
      indent: 2
    });

    fs.writeFileSync(CONFIG.outputFile, yamlContent);
    console.log('✅ API documentation generated successfully!');

    // Summary
    const pathCount = Object.keys(routes).length;
    const methodCount = Object.values(routes).reduce((count, route) => {
      return count + Object.keys(route).length;
    }, 0);

    console.log(`📊 Summary:`);
    console.log(`   • ${pathCount} API paths`);
    console.log(`   • ${methodCount} HTTP methods`);
    console.log(`   • ${Object.keys(spec.components.schemas).length} schemas`);
    console.log(`   • Environment: ${CONFIG.environment}`);

  } catch (error) {
    console.error('❌ Error writing documentation:', error.message);
    process.exit(1);
  }
}

/**
 * Watch mode for development
 */
function watchMode() {
  console.log('👀 Watching for changes in API files...');
  const chokidar = require('chokidar');

  const watcher = chokidar.watch(CONFIG.apiPath, {
    ignored: /node_modules/,
    persistent: true
  });

  watcher.on('change', (path) => {
    console.log(`🔄 File changed: ${path}`);
    generateDocumentation();
  });

  // Initial generation
  generateDocumentation();
}

// CLI handling
const args = process.argv.slice(2);

if (args.includes('--watch') || args.includes('-w')) {
  // Check if chokidar is available
  try {
    require('chokidar');
    watchMode();
  } catch (error) {
    console.error('❌ Watch mode requires chokidar. Install it with: npm install --save-dev chokidar');
    process.exit(1);
  }
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🛩️  Fly-Fleet API Documentation Generator

Usage:
  node scripts/generate-api-docs.js [options]

Options:
  -w, --watch     Watch for file changes and regenerate
  -h, --help      Show this help message
  -v, --verbose   Verbose output

Environment Variables:
  NODE_ENV        Environment (development|staging|production)
  DOCS_VERBOSE    Enable verbose output (true|false)

Examples:
  node scripts/generate-api-docs.js
  node scripts/generate-api-docs.js --watch
  DOCS_VERBOSE=true node scripts/generate-api-docs.js
  NODE_ENV=production node scripts/generate-api-docs.js
`);
} else {
  generateDocumentation();
}

module.exports = {
  generateDocumentation,
  CONFIG
};