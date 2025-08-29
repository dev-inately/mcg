# MyCoverGenius

A mini insuretech API for insurance products and policies built with NestJS, Sequelize, and PostgreSQL.

## 🚀 Features

- **Insurance Products Management**: Create and manage insurance products with categories
- **Plan Management**: Users can create insurance plans with wallet balance validation
- **Policy Management**: Activate pending policies and manage active policies
- **User Management**: User registration with wallet system
- **Comprehensive API**: RESTful endpoints with proper validation and error handling

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MyCoverGenius
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=mycovergenius

# Application Configuration
PORT=3000
NODE_ENV=development
```

### Test Environment

For running tests, create a `.env.test` file:

```env
# Test Database Configuration
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=mycovergenius-test

# Test Application Configuration
PORT=3001
NODE_ENV=test
```

## 🗄️ Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U your_username -h localhost

# Create the main database
CREATE DATABASE mycovergenius;

# Create the test database
CREATE DATABASE "mycovergenius-test";

# Exit PostgreSQL
\q
```

### 2. Run Database Migrations

The application uses Sequelize with `synchronize: true` in development mode, which automatically creates tables based on your models.

## 🌱 Database Seeding

### Development Seeding

To seed the development database with initial data:

```bash
# Run the seed command
npm run seed
```

This will create:
- Product categories (Health Insurance, Auto Insurance)
- Sample products with pricing
- Sample users with wallet balances
- Initial plans and pending policies

### Test Seeding

Test data is automatically seeded when running e2e tests. The test seed creates:
- Test product categories and products
- Test users with predefined wallet balances
- Test plans and pending policies for testing

## 🚀 Running the Application

### Development Mode

```bash
# Start the application in development mode
npm run start:dev
```

The API will be available at `http://localhost:3000`

### Production Mode

```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

### Debug Mode

```bash
# Start with debugging enabled
npm run start:debug
```

## 🧪 Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

### E2E Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run e2e tests in watch mode
npm run test:e2e:watch
```

### Test Coverage

```bash
# Generate test coverage report
npm run test:cov

# Generate e2e test coverage
npm run test:e2e:cov
```

## 📚 API Documentation

Once the application is running, you can access the Swagger API documentation at:

```
http://localhost:3000/docs
```

## 🏗️ Project Structure

```
MyCoverGenius/
├── src/
│   ├── modules/           # Feature modules
│   │   ├── products/      # Product management
│   │   ├── plans/         # Plan management
│   │   ├── policies/      # Policy management
│   │   ├── pending-policies/ # Pending policy management
│   │   └── users/         # User management
│   ├── models/            # Sequelize models
│   ├── common/            # Shared utilities and interceptors
│   ├── config/            # Configuration files
│   └── main.ts            # Application entry point
├── test/                  # E2E test files
├── .env                   # Environment variables
├── .env.test             # Test environment variables
└── package.json           # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run start:dev` - Start development server
- `npm run start:debug` - Start with debugging
- `npm run start:prod` - Start production server
- `npm run build` - Build the application
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:e2e` - Run e2e tests
- `npm run test:e2e:watch` - Run e2e tests in watch mode
- `npm run seed` - Seed the database
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## 🧪 Testing Strategy

### Unit Tests
- Test individual service methods
- Mock external dependencies
- Fast execution for development feedback

### E2E Tests
- Test complete API endpoints
- Use PostgreSQL test database
- Validate business logic and data flow
- Test error scenarios and edge cases

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Port Already in Use**
   - Change the port in `.env`
   - Kill existing processes using the port

3. **Test Database Issues**
   - Ensure `mycovergenius-test` database exists
   - Check test environment variables
   - Run tests with `--detectOpenHandles` flag if needed

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` and check the console for detailed logs.

## 📝 API Endpoints

### Products
- `GET /api/v1/products` - Get all products
- `GET /api/v1/products/:id` - Get product by ID
- `GET /api/v1/products/categories` - Get all product categories

### Plans
- `POST /api/v1/plans` - Create a new plan
- `GET /api/v1/plans/:id` - Get plan by ID
- `GET /api/v1/plans/user/:userId` - Get plans for a user

### Policies
- `GET /api/v1/policies` - Get policies with planId filter
- `POST /api/v1/policies/activate` - Activate a pending policy

### Pending Policies
- `GET /api/v1/plans/:id/pending-policies` - Get pending policies for a plan
- `GET /api/v1/plans/:id/pending-policies/unused` - Get unused pending policies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/docs`
- Review the test files for usage examples
- Check the console logs for debugging information
