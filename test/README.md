# End-to-End Tests

This directory contains comprehensive end-to-end tests for the MyCoverGenius API.

## Test Structure

- `app.e2e-spec.ts` - Main application tests (bootstrap, CORS, Swagger)
- `products.e2e-spec.ts` - Product endpoint tests
- `plans.e2e-spec.ts` - Plan endpoint tests  
- `pending-policies.e2e-spec.ts` - Pending policy endpoint tests
- `policies.e2e-spec.ts` - Policy endpoint tests
- `test-utils.ts` - Utility functions for common test operations
- `test-config.ts` - Test configuration and setup helpers

## Test Database

The tests use an in-memory SQLite database that gets seeded with initial data before each test suite runs. The seed data includes:

- Product categories (Health Insurance, Auto Insurance)
- Products (Optimal Care Mini, Optimal Care Standard, Third-Party, Comprehensive)
- Sample users (John Doe, Jane Smith)
- Wallets with initial balances

## Running Tests

### Prerequisites

1. Copy `.env.test.sample` to `.env.test`
2. Ensure all dependencies are installed: `npm install`

### Commands

```bash
# Run all e2e tests
npm run test:e2e

# Run specific test file
npm run test:e2e -- --testNamePattern="Products"

# Run tests in watch mode
npm run test:e2e -- --watch

# Run tests with coverage
npm run test:e2e -- --coverage
```

## Test Design Principles

1. **Database Seeding**: Each test suite seeds the database with fresh data
2. **Isolation**: Tests are independent and don't affect each other
3. **Realistic Scenarios**: Tests cover both success and error cases
4. **API Contract Validation**: Tests verify response structure and status codes
5. **Business Logic Testing**: Tests validate core business rules

## Expected Behavior Notes

- Some endpoints return 200 with empty/null data instead of 404 when no resources exist
- This is by design and tests verify this behavior
- Wallet balance validation is tested for plan creation
- Duplicate plan prevention is tested
- Policy activation business rules are validated

## Troubleshooting

### Common Issues

1. **Database Connection Errors**: Ensure `.env.test` is properly configured
2. **Timeout Errors**: Increase timeout in `jest-e2e.setup.ts` if needed
3. **Model Import Errors**: Check that all models are properly exported from `src/models/index.ts`

### Debug Mode

Run tests in debug mode to get more detailed output:

```bash
npm run test:debug
```

## Adding New Tests

When adding new endpoints or modules:

1. Create a new `{module-name}.e2e-spec.ts` file
2. Follow the existing test structure and naming conventions
3. Add any necessary test utilities to `test-utils.ts`
4. Update this README with new test information
