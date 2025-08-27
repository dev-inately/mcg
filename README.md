# MyCoverGenius Backend Engineer Assessment

A mini insuretech API built with NestJS, Sequelize-TypeScript, and PostgreSQL that allows users to browse insurance products, purchase plans, and manage policies.

## 🚀 Features

- **Product Management**: Browse insurance products by category (Health & Auto)
- **Plan Purchasing**: Buy insurance plans with multiple product units
- **Wallet Management**: Automatic wallet deduction based on plan quantity
- **Pending Policies**: Create slots (pending policies) based on purchased quantity
- **Policy Activation**: Activate pending policies to create active policies
- **Policy Management**: View and filter active policies
- **Business Rules**: Enforce one policy per user per plan rule

## 🏗️ Architecture

- **Backend Framework**: NestJS with TypeScript
- **ORM**: Sequelize with TypeScript decorators
- **Database**: PostgreSQL
- **Validation**: Class-validator with DTOs
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest for unit and integration tests
- **Logging**: Pino with structured logging and performance monitoring

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd MyCoverGenius
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=mycovergenius
   DB_DIALECT=postgres

   # Application Configuration
   PORT=3000
   NODE_ENV=development
   
   # Logging Configuration
   LOG_LEVEL=info
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb mycovergenius
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE mycovergenius;
   ```

5. **Run the Application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production build
   npm run build
   npm run start:prod
   ```

## 🧪 Testing

Run the test suite:

```bash
# Unit tests
npm test

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## 📝 Logging

The application uses Pino for high-performance structured logging:

### **Log Levels**
- **ERROR**: Failed operations, exceptions, business rule violations
- **WARN**: Business rule warnings, validation failures  
- **INFO**: Successful operations, important business events
- **DEBUG**: Detailed operation information, data mapping

### **Logging Features**
- **Performance Monitoring**: API response times, database operation durations
- **Business Logic Tracking**: All insurance operations with detailed context
- **Error Handling**: Comprehensive error logging with stack traces
- **Request/Response Logging**: HTTP method, URL, status codes, duration
- **Database Operations**: Connection, queries, transactions, seeding

### **Configuration**
```bash
# Set log level (default: info)
LOG_LEVEL=debug

# Environment-based formatting
NODE_ENV=development  # Pretty-printed, colored logs
NODE_ENV=production   # JSON structured logs
```

### **Sample Log Output**
```
[INFO] GET /products - Fetching all products
[INFO] Successfully fetched 4 products
[DEBUG] Products data mapped successfully {"productCount":4,"categories":["Health","Auto"]}
[INFO] GET /products - Successfully fetched all products {"productCount":4,"duration":"45ms"}
```

## 📚 API Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:3000/api
- **API Base URL**: http://localhost:3000

## 🔌 API Endpoints

### Products
- `GET /products` - Get all products with categories and prices
- `GET /products/categories` - Get all product categories with products
- `GET /products/category/:id` - Get products by category ID
- `GET /products/:id` - Get product by ID

### Plans
- `POST /plans` - Purchase a new plan
- `GET /plans/:id` - Get plan by ID
- `GET /plans/user/:userId` - Get all plans for a user

### Pending Policies
- `GET /plans/:id/pending-policies` - Get pending policies under a plan
- `GET /plans/:id/pending-policies/unused` - Get unused pending policies under a plan

### Policies
- `POST /policies/activate` - Activate a pending policy
- `GET /policies` - Get all activated policies
- `GET /policies?plan_id=X` - Filter policies by plan ID
- `GET /policies/:id` - Get policy by ID

## 📊 Database Schema

### Core Entities
- **Users**: User information and wallet balance
- **ProductCategories**: Insurance product categories (Health, Auto)
- **Products**: Insurance products with pricing
- **Plans**: User purchases of products
- **PendingPolicies**: Available policy slots (soft deleted when used)
- **Policies**: Active insurance policies

### Relationships
- Users have many Plans and Policies
- ProductCategories have many Products
- Products have many Plans
- Plans have many PendingPolicies
- PendingPolicies create one Policy
- Policies belong to Users and Plans

## 💰 Product Pricing

### Health Products
- **Optimal Care Mini**: ₦10,000 per unit
- **Optimal Care Standard**: ₦20,000 per unit

### Auto Products
- **Third-Party**: ₦5,000 per unit
- **Comprehensive**: ₦15,000 per unit

## 🔒 Business Rules

1. **Wallet Validation**: Users must have sufficient balance to purchase plans
2. **One Policy Per Plan**: Users can only have one active policy per plan
3. **Pending Policy Creation**: Number of pending policies equals plan quantity
4. **Soft Delete**: Pending policies are soft deleted when activated
5. **Unique Policy Numbers**: Each policy gets a unique identifier (MCG-YYYYMMDD-XXXX)

## 🚀 Getting Started

### 1. Start the Application
```bash
npm run start:dev
```

### 2. Test the API
```bash
# Get all products
curl http://localhost:3000/products

# Get product categories
curl http://localhost:3000/products/categories

# Purchase a plan (example)
curl -X POST http://localhost:3000/plans \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "product_id": 1,
    "quantity": 2
  }'
```

### 3. View Swagger Documentation
Open http://localhost:3000/api in your browser to explore the interactive API documentation.

## 🧪 Sample Data

The application comes with pre-seeded data:
- **Users**: John Doe (₦100,000), Jane Smith (₦75,000), Bob Johnson (₦50,000)
- **Categories**: Health, Auto
- **Products**: All 4 insurance products with correct pricing

## 🔍 Testing Scenarios

### 1. Product Browsing
- Fetch all products and verify categories and pricing
- Filter products by category
- Get individual product details

### 2. Plan Purchase
- Purchase a plan with valid user and product
- Verify wallet deduction
- Check pending policy creation

### 3. Policy Activation
- List pending policies under a plan
- Activate a pending policy
- Verify policy creation and pending policy soft deletion

### 4. Policy Management
- View all active policies
- Filter policies by plan
- Verify one policy per user per plan rule

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing process on port 3000

3. **Validation Errors**
   - Check request body format
   - Verify required fields are provided
   - Ensure data types match DTOs

### Logs
Check application logs for detailed error information:
```bash
npm run start:dev
```

## 📝 Development

### Project Structure
```
src/
├── config/           # Configuration files
├── database/         # Database setup and seeding
├── models/           # Sequelize models
├── modules/          # Feature modules
│   ├── products/     # Product management
│   ├── plans/        # Plan management
│   ├── pending-policies/ # Pending policy management
│   └── policies/     # Policy management
├── dto/              # Data Transfer Objects
└── interfaces/       # TypeScript interfaces
```

### Adding New Features
1. Create models in `src/models/`
2. Add DTOs in `src/dto/`
3. Implement services in `src/modules/`
4. Create controllers in `src/modules/`
5. Update modules and app.module.ts
6. Add tests
7. Update documentation

## 📄 License

This project is part of the MyCoverGenius Backend Engineer Assessment.

## 🤝 Contact

For questions or support:
- **Phone**: 08160161074
- **Email**: [To be provided]

---

**Note**: This API is designed for demonstration purposes and includes comprehensive business logic validation, proper error handling, and extensive testing coverage.
