# MyCoverGenius Backend Engineer Assessment - Implementation Checklist

## Project Plan: MyCoverGenius Backend Engineer Assessment

### Overview
Build a mini insuretech API using NestJS, Sequelize-TypeScript, and PostgreSQL that allows users to:
- Browse insurance products (Health & Auto categories)
- Purchase plans with multiple product units
- Manage pending policies and activate them
- View active policies with filtering capabilities

### Architecture & Technology Stack
- **Backend Framework**: NestJS
- **ORM**: Sequelize with TypeScript
- **Database**: PostgreSQL
- **Testing**: Jest (unit/integration tests)
- **API Documentation**: Swagger/OpenAPI

## Implementation Checklist

### Phase 1: Project Setup & Configuration
- [x] Initialize NestJS project with TypeScript
- [x] Set up PostgreSQL database connection
- [x] Configure Sequelize with TypeScript
- [x] Set up project structure and folder organization
- [x] Configure environment variables and configuration files
- [x] Set up testing framework (Jest)
- [x] Initialize Git repository

### Phase 2: Database Design & Models
- [x] Design database schema with proper relationships:
  - [x] Users table (seeded data)
  - [x] Product Categories table
  - [x] Products table (with price and category)
  - [x] Plans table (user purchases)
  - [x] Pending Policies table (slots)
  - [x] Policies table (activated policies)
- [x] Create Sequelize models with proper associations
- [x] Implement database migrations
- [x] Set up database seeding for initial data

### Phase 3: Core Business Logic Implementation
- [x] Implement Product service and controller:
  - [x] Fetch all products with categories and prices
  - [x] Filter products by category
- [x] Implement Plan service and controller:
  - [x] Purchase plan functionality
  - [x] Wallet deduction logic
  - [x] Create pending policies based on quantity
- [x] Implement Pending Policy service and controller:
  - [x] List pending policies under a plan
  - [x] Activate pending policy (create policy + soft delete)
- [x] Implement Policy service and controller:
  - [x] List all activated policies
  - [x] Filter policies by plan
  - [x] Ensure one policy per user per plan rule

### Phase 4: API Endpoints Implementation
- [x] **GET /products** - Fetch all products with categories and prices
- [x] **POST /plans** - Purchase a plan (quantity, product_id, user_id)
- [x] **GET /plans/:id/pending-policies** - List pending policies under a plan
- [x] **POST /policies/activate** - Activate a pending policy
- [x] **GET /policies** - List all activated policies
- [x] **GET /policies?plan_id=X** - Filter policies by plan

### Phase 5: Business Rules & Validation
- [x] Implement wallet balance validation
- [x] Ensure one policy per user per plan rule
- [x] Validate product quantities and pricing
- [x] Implement proper error handling and validation
- [x] Add input validation using DTOs and class-validator

### Phase 6: Testing
- [x] Write unit tests for services
- [x] Write integration tests for controllers
- [x] Write database integration tests
- [x] Test business logic scenarios
- [x] Ensure test coverage meets requirements

### Phase 7: Documentation & Deployment
- [x] Create comprehensive API documentation
- [x] Write detailed README with setup instructions
- [x] Document testing procedures
- [x] Set up Swagger/OpenAPI documentation
- [x] Prepare GitHub repository with proper structure

### Phase 8: Final Review & Submission
- [ ] Code review and refactoring
- [ ] Performance testing
- [ ] Security review
- [ ] Final testing of all endpoints
- [ ] Push to GitHub with detailed README
- [ ] Prepare submission email

## Database Schema Overview

```
Users (id, name, wallet_balance, created_at, updated_at)
ProductCategories (id, name, description, created_at, updated_at)
Products (id, name, price, category_id, created_at, updated_at)
Plans (id, user_id, product_id, quantity, total_amount, created_at, updated_at)
PendingPolicies (id, plan_id, status, created_at, updated_at, deleted_at)
Policies (id, pending_policy_id, user_id, plan_id, policy_number, created_at, updated_at)
```

## Key Business Rules to Implement
1. **Wallet Management**: Deduct total amount based on quantity × product price
2. **Pending Policy Creation**: Create slots equal to purchased quantity
3. **Policy Activation**: Generate unique policy numbers and soft delete pending policies
4. **User Policy Limit**: Maximum one policy per user per plan
5. **Soft Delete**: Pending policies are soft deleted when activated

## Product Specifications
### Health Products
- **Optimal Care Mini**: ₦10,000 per unit
- **Optimal Care Standard**: ₦20,000 per unit

### Auto Products
- **Third-Party**: ₦5,000 per unit
- **Comprehensive**: ₦15,000 per unit

## Acceptance Criteria Checklist
- [ ] Fetch various products with associated product category and price
- [ ] Buy a plan with wallet deduction based on quantity
- [ ] View list of pending policies under a plan
- [ ] Activate pending policies (soft delete on activation)
- [ ] View all activated policies with plan filtering
- [ ] Ensure user has only one policy per plan

## Technical Requirements
- [ ] Well-thought-out entity relationships
- [ ] No authentication API (use seeding for user data)
- [ ] Unit or integration tests
- [ ] GitHub public repository
- [ ] Detailed README with testing instructions

## Timeline Estimate
- **Phase 1-2**: 1-2 days (Setup & Database)
- **Phase 3-4**: 2-3 days (Core Logic & APIs)
- **Phase 5**: 1 day (Validation & Rules)
- **Phase 6**: 1-2 days (Testing)
- **Phase 7-8**: 1 day (Documentation & Final Review)

**Total Estimated Time**: 6-9 days

## Submission Deadline
**Latest by 29th August, 2025 by 5PM**

## Contact Information
- **Phone**: 08160161074
- **Email**: [To be provided]

---

**Note**: This checklist provides a structured approach to building the MyCoverGenius API while ensuring all requirements are met. Each phase builds upon the previous one, allowing for iterative development and testing.
