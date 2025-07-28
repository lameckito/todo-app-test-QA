# Todo App with Comprehensive Testing Suite

A full-stack Todo application with React frontend and Node.js backend, featuring comprehensive automated testing with Jest, Supertest, and Cypress.

## 🚀 Quick Start (< 2 minutes setup)

### Prerequisites
- Node.js 16+ and npm
- Chrome browser (for Cypress tests)

### 1. Backend Setup
```bash
# Clone or create project directory
mkdir todo-app-testing && cd todo-app-testing

# Install backend dependencies
npm install

# Start the backend server
npm start
# Server will run on http://localhost:5000
```

### 2. Frontend Setup
```bash
# In a new terminal window
mkdir frontend && cd frontend

# Initialize React app
npx create-react-app . --template typescript
# Note: Use the React component from the artifacts above as App.js

# Install additional dependencies
npm install

# Start frontend
npm start
# Frontend will run on http://localhost:3000
```

### 3. Run Tests
```bash
# In the root directory

# Run API tests
npm run test:api

# Run E2E tests (ensure both frontend and backend are running)
npm run cypress:run

# Run all tests with coverage
npm run test:coverage
```

## 📁 Project Structure

```
todo-app-testing/
├── server.js                 # Backend API server
├── package.json              # Backend dependencies & scripts
├── cypress.config.js         # Cypress configuration
├── tests/
│   └── api.test.js           # API test suite
├── cypress/
│   ├── e2e/
│   │   └── todo-app.cy.js    # E2E test suite
│   └── support/
│       └── e2e.js            # Cypress support files
├── frontend/
│   ├── src/
│   │   └── App.js            # React application
│   └── package.json          # Frontend dependencies
├── coverage/                 # Test coverage reports
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI/CD
└── README.md
```

## 🧪 Testing Strategy

### API Testing (Jest + Supertest)
- **Authentication**: Login endpoint validation
- **CRUD Operations**: Todo create, read, update, delete
- **Authorization**: User-specific data access
- **Error Handling**: Invalid input and unauthorized access
- **Coverage**: 90%+ code coverage target

### UI Testing (Cypress)
- **Authentication Flow**: Login/logout functionality
- **Todo Management**: Full CRUD operations in browser
- **User Experience**: Loading states, error messages
- **Responsive Design**: Mobile and desktop testing
- **Data Persistence**: Session and state management

## 📊 Available Scripts

### Backend Scripts
```bash
npm start              # Start production server
npm run dev           # Start development server with nodemon
npm test              # Run all tests
npm run test:api      # Run only API tests
npm run test:coverage # Run tests with coverage report
npm run test:watch    # Run tests in watch mode
```

### E2E Testing Scripts
```bash
npm run cypress:open  # Open Cypress Test Runner (interactive)
npm run cypress:run   # Run Cypress tests (headless)
npm run test:e2e      # Start server and run E2E tests
npm run test:all      # Run both API and E2E tests
```

## 🔐 Test Credentials

The application includes demo users for testing:

| Username | Password | Role        |
|----------|----------|-------------|
| admin    | password | Admin user  |
| user     | password | Regular user|

## 🏗️ Application Features

### Backend API (Node.js/Express)
- JWT-based authentication
- RESTful API endpoints
- User-specific data isolation
- Input validation and sanitization
- Comprehensive error handling

### Frontend (React)
- Modern React with hooks
- JWT token management
- Real-time UI updates
- Responsive design
- Loading states and error handling

## 🔧 Configuration

### Environment Variables
```bash
PORT=5000                    # Backend server port
JWT_SECRET=your-secret-key   # JWT signing secret
NODE_ENV=development         # Environment mode
```

### Cypress Configuration
- Base URL: `http://localhost:3000`
- Viewport: 1280x720
- Video recording: Enabled
- Screenshots on failure: Enabled
- Default timeout: 10 seconds

## 📈 Coverage Reports

After running tests with coverage:
```bash
npm run test:coverage
```

Reports are generated in multiple formats:
- **Terminal**: Immediate feedback
- **HTML**: `coverage/lcov-report/index.html`
- **LCOV**: `coverage/lcov.info` (for CI/CD integration)

## 🚦 Continuous Integration

### GitHub Actions
The project includes a CI/CD pipeline (`.github/workflows/ci.yml`) that:
1. Sets up Node.js environment
2. Installs dependencies
3. Runs API tests with coverage
4. Starts backend and frontend servers
5. Executes E2E tests
6. Uploads test artifacts and coverage reports

### CI Configuration Example
```yaml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes on ports 3000 and 5000
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5000 | xargs kill -9
   ```

2. **Cypress Installation Issues**
   ```bash
   # Clear Cypress cache and reinstall
   npx cypress cache clear
   npm install cypress --save-dev
   ```

3. **Test Failures**
   ```bash
   # Check if servers are running
   curl http://localhost:5000/api/health
   curl http://localhost:3000
   
   # Run tests with verbose output
   npm run test:api -- --verbose
   ```

4. **CORS Issues**
   - Ensure backend server includes CORS middleware
   - Check frontend API base URL configuration

## 📋 Test Examples

### API Test Example
```javascript
describe('POST /api/login', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ username: 'admin', password: 'password' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

### E2E Test Example
```javascript
it('should create a new todo', () => {
  cy.get('[data-testid="new-todo-input"]').type('New Test Todo');
  cy.get('[data-testid="add-todo-button"]').click();
  cy.contains('New Test Todo').should('be.visible');
});
```

## 🎯 Key Testing Scenarios

### Positive Scenarios
- ✅ User authentication and session management
- ✅ Complete todo lifecycle (CRUD operations)
- ✅ Data persistence across page refreshes
- ✅ User-specific data isolation

### Negative Scenarios
- ✅ Invalid login credentials
- ✅ Unauthorized API access attempts
- ✅ Invalid input validation
- ✅ Network error handling

### Edge Cases
- ✅ Empty states and boundary conditions
- ✅ Concurrent user operations
- ✅ Browser compatibility testing
- ✅ Mobile responsive design

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Documentation](https://docs.cypress.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [React Testing Best Practices](https://testing-library.com/docs/react-testing-library/intro/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Setup Time**: < 2 minutes | **Test Execution**: ~3-5 minutes | **Coverage**: 90%+ backend, comprehensive frontend

For questions or issues, please check the troubleshooting section or create an issue in the repository.
