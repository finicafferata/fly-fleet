# Fly-Fleet API Documentation

This directory contains the complete API documentation for the Fly-Fleet private jet charter platform.

## Documentation Files

- **`openapi.yaml`** - Complete OpenAPI 3.0.3 specification
- **`api-documentation.md`** - This file, providing setup instructions

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### 1. Install Documentation Tools

Choose one of the following options to serve the API documentation:

#### Option A: Swagger UI (Recommended)

```bash
# Install swagger-ui-serve globally
npm install -g swagger-ui-serve

# Or install locally in your project
npm install --save-dev swagger-ui-serve
```

#### Option B: Redoc CLI

```bash
# Install redoc-cli globally
npm install -g redoc-cli

# Or install locally in your project
npm install --save-dev redoc-cli
```

#### Option C: Stoplight Elements

```bash
# Install @stoplight/elements
npm install --save-dev @stoplight/elements
```

### 2. Serve the Documentation

#### Using Swagger UI

```bash
# If installed globally
swagger-ui-serve openapi.yaml

# If installed locally
npx swagger-ui-serve openapi.yaml

# With custom port
swagger-ui-serve -p 8080 openapi.yaml
```

The documentation will be available at: `http://localhost:3200`

#### Using Redoc

```bash
# Serve interactively
redoc-cli serve openapi.yaml

# Generate static HTML
redoc-cli build openapi.yaml --output docs/api.html

# With custom options
redoc-cli serve openapi.yaml --port 8080 --watch
```

#### Using Stoplight Elements

Create a simple HTML file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <title>Fly-Fleet API Documentation</title>
  <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
  <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
</head>
<body>
  <elements-api
    apiDescriptionUrl="./openapi.yaml"
    basePath="/"
    router="hash"
  />
</body>
</html>
```

### 3. Add to Package.json Scripts

Add these scripts to your `package.json` for easy access:

```json
{
  "scripts": {
    "docs:serve": "swagger-ui-serve openapi.yaml",
    "docs:build": "redoc-cli build openapi.yaml --output docs/api.html",
    "docs:dev": "swagger-ui-serve -p 8080 openapi.yaml"
  }
}
```

Then run:

```bash
npm run docs:serve
npm run docs:build
npm run docs:dev
```

## Documentation Features

### Interactive Testing

The Swagger UI interface allows you to:

- View all API endpoints with detailed descriptions
- See request/response schemas with examples
- Test endpoints directly from the browser
- View authentication requirements
- Copy curl commands for each endpoint

### Comprehensive Coverage

The documentation includes:

- **15 main API endpoints** across 11 functional areas
- **Complete request/response schemas** with validation rules
- **Authentication patterns** for admin and public endpoints
- **Rate limiting information** for security
- **Multilingual support** details (ES/EN/PT)
- **Error response formats** with HTTP status codes
- **Example requests and responses** for all endpoints

### Key API Areas Documented

1. **Quote Management** - Submit and track charter requests
2. **Contact Forms** - General inquiry handling
3. **Airport Search** - Fuzzy search with localization
4. **Content Management** - CMS with multilingual support
5. **FAQ System** - Categorized frequently asked questions
6. **Analytics** - Event tracking with GA4 integration
7. **WhatsApp Integration** - Generate pre-filled message links
8. **Admin Operations** - Quote management and bulk operations
9. **Webhook Handling** - Email service event processing
10. **reCAPTCHA Verification** - Form security validation
11. **SEO Metadata** - Dynamic SEO content generation

## Validation and Testing

### Schema Validation

The OpenAPI specification includes comprehensive Zod schema validation patterns:

- String length limits and format validation
- Enum value restrictions
- Required vs optional field definitions
- Custom validation rules (e.g., IATA codes, date formats)

### Rate Limiting

Different endpoints have varying rate limits:

- Quote API: 7 requests/hour per IP
- Contact API: 5 requests/hour per IP
- WhatsApp API: 20 requests/hour per IP

### Authentication

Admin endpoints require:

- Bearer token in Authorization header
- Admin email in `x-admin-email` header
- Valid email domain verification

## Integration with Development Workflow

### Auto-Update Setup (Recommended)

To keep documentation synchronized with code changes:

1. **Install swagger-jsdoc** for inline documentation:

```bash
npm install --save-dev swagger-jsdoc js-yaml
```

2. **Create a documentation generation script** (`scripts/generate-docs.js`):

```javascript
const swaggerJSDoc = require('swagger-jsdoc');
const fs = require('fs');
const yaml = require('js-yaml');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Fly-Fleet API',
      version: '1.0.0',
    },
  },
  apis: ['./src/app/api/**/*.ts'], // Path to the API files
};

const specs = swaggerJSDoc(options);
fs.writeFileSync('./openapi.yaml', yaml.dump(specs));
console.log('OpenAPI documentation generated!');
```

3. **Add inline JSDoc comments** to your API routes:

```typescript
/**
 * @swagger
 * /api/quote:
 *   post:
 *     summary: Submit a quote request
 *     tags: [quotes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuoteRequest'
 */
export async function POST(req: NextRequest) {
  // Your implementation
}
```

4. **Add to package.json scripts**:

```json
{
  "scripts": {
    "docs:generate": "node scripts/generate-docs.js",
    "docs:watch": "nodemon --watch src/app/api --exec 'npm run docs:generate'",
    "build": "npm run docs:generate && next build"
  }
}
```

### Git Hooks Integration

Add a pre-commit hook to ensure documentation stays current:

```bash
# .husky/pre-commit
#!/bin/sh
npm run docs:generate
git add openapi.yaml
```

### CI/CD Integration

For automated documentation deployment:

```yaml
# .github/workflows/docs.yml
name: Deploy API Documentation

on:
  push:
    branches: [main]

jobs:
  deploy-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run docs:generate
      - run: npm run docs:build
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
```

## Customization Options

### Swagger UI Themes

Customize the appearance by modifying the swagger-ui-serve options:

```bash
swagger-ui-serve openapi.yaml --theme dark --port 8080
```

### Redoc Styling

Create a custom Redoc build with styling:

```bash
redoc-cli build openapi.yaml \
  --options.theme.colors.primary.main="#1976d2" \
  --options.theme.typography.fontSize="14px" \
  --output docs/api.html
```

### Environment-Specific Documentation

Generate different documentation for different environments:

```javascript
// scripts/generate-docs-env.js
const environment = process.env.NODE_ENV || 'development';

const servers = {
  development: [{ url: 'http://localhost:3000', description: 'Development' }],
  staging: [{ url: 'https://staging-api.fly-fleet.com', description: 'Staging' }],
  production: [{ url: 'https://api.fly-fleet.com', description: 'Production' }]
};

const spec = {
  // ... base spec
  servers: servers[environment]
};
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change the port using `-p` or `--port` flags
2. **YAML syntax errors**: Validate using online YAML validators
3. **OpenAPI validation**: Use swagger-editor for spec validation
4. **CORS issues**: Serve from the same domain as your API

### Validation Commands

```bash
# Validate OpenAPI spec
npx swagger-parser validate openapi.yaml

# Check for best practices
npx @apidevtools/swagger-parser validate openapi.yaml

# Generate client SDK
npx @openapitools/openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-fetch \
  -o generated/client
```

## Support and Resources

- **OpenAPI Specification**: https://spec.openapis.org/oas/v3.0.3
- **Swagger UI Documentation**: https://swagger.io/docs/open-source-tools/swagger-ui/
- **Redoc Documentation**: https://redoc.ly/docs/
- **Stoplight Elements**: https://meta.stoplight.io/docs/elements

For questions about this API documentation, contact: contact@fly-fleet.com