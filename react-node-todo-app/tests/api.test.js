const request = require('supertest');
const app = require('../server');

describe('Todo API Tests', () => {
  let authToken = '';
  let userId = 1;
  let createdTodoId = null;

  beforeAll(async () => {
    // Login to get auth token for subsequent tests
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        username: 'admin',
        password: 'password'
      });
    
    authToken = loginResponse.body.token;
    userId = loginResponse.body.user.id;
  });

  describe('POST /api/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'admin',
          password: 'password'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('admin');
      expect(response.body.message).toBe('Login successful');
    });

    it('should reject invalid username', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'invaliduser',
          password: 'password'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'admin',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    it('should reject missing username', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          password: 'password'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and password required');
    });

    it('should reject missing password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'admin'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and password required');
    });

    it('should reject empty request body', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and password required');
    });
  });

  describe('GET /api/items', () => {
    it('should get todos for authenticated user', async () => {
      const response = await request(app)
        .get('/api/items')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // Check that all returned todos belong to the authenticated user
      response.body.forEach(todo => {
        expect(todo).toHaveProperty('id');
        expect(todo).toHaveProperty('title');
        expect(todo).toHaveProperty('completed');
        expect(todo.userId).toBe(userId);
      });
    });

    it('should reject request without auth token', async () => {
      const response = await request(app)
        .get('/api/items');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });

    it('should reject request with invalid auth token', async () => {
      const response = await request(app)
        .get('/api/items')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Invalid or expired token');
    });

    it('should reject malformed auth header', async () => {
      const response = await request(app)
        .get('/api/items')
        .set('Authorization', 'InvalidFormat');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('POST /api/items', () => {
    it('should create a new todo with valid data', async () => {
      const newTodo = {
        title: 'Test Todo from API',
        completed: false
      };

      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTodo);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newTodo.title);
      expect(response.body.completed).toBe(false);
      expect(response.body.userId).toBe(userId);
      
      // Store created todo ID for later tests
      createdTodoId = response.body.id;
    });

    it('should create todo with default completed status when not provided', async () => {
      const newTodo = {
        title: 'Todo without completed status'
      };

      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTodo);

      expect(response.status).toBe(201);
      expect(response.body.completed).toBe(false);
    });

    it('should trim whitespace from title', async () => {
      const newTodo = {
        title: '   Whitespace Todo   '
      };

      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTodo);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Whitespace Todo');
    });

    it('should reject empty title', async () => {
      const newTodo = {
        title: '',
        completed: false
      };

      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTodo);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title is required');
    });

    it('should reject whitespace-only title', async () => {
      const newTodo = {
        title: '   ',
        completed: false
      };

      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTodo);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title is required');
    });

    it('should reject missing title', async () => {
      const newTodo = {
        completed: false
      };

      const response = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTodo);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title is required');
    });

    it('should reject request without auth token', async () => {
      const newTodo = {
        title: 'Unauthorized Todo'
      };

      const response = await request(app)
        .post('/api/items')
        .send(newTodo);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('PUT /api/items/:id', () => {
    let todoToUpdate;

    beforeAll(async () => {
      // Create a todo to update
      const createResponse = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Todo to Update' });
      
      todoToUpdate = createResponse.body;
    });

    it('should update todo title', async () => {
      const updatedData = {
        title: 'Updated Todo Title'
      };

      const response = await request(app)
        .put(`/api/items/${todoToUpdate.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updatedData.title);
      expect(response.body.id).toBe(todoToUpdate.id);
      expect(response.body.completed).toBe(todoToUpdate.completed);
    });

    it('should update todo completed status', async () => {
      const updatedData = {
        completed: true
      };

      const response = await request(app)
        .put(`/api/items/${todoToUpdate.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(true);
      expect(response.body.id).toBe(todoToUpdate.id);
    });

    it('should update both title and completed status', async () => {
      const updatedData = {
        title: 'Fully Updated Todo',
        completed: false
      };

      const response = await request(app)
        .put(`/api/items/${todoToUpdate.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updatedData.title);
      expect(response.body.completed).toBe(updatedData.completed);
    });

    it('should trim whitespace from updated title', async () => {
      const updatedData = {
        title: '   Trimmed Title   '
      };

      const response = await request(app)
        .put(`/api/items/${todoToUpdate.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Trimmed Title');
    });

    it('should reject empty title update', async () => {
      const updatedData = {
        title: ''
      };

      const response = await request(app)
        .put(`/api/items/${todoToUpdate.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title cannot be empty');
    });

    it('should reject whitespace-only title update', async () => {
      const updatedData = {
        title: '   '
      };

      const response = await request(app)
        .put(`/api/items/${todoToUpdate.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title cannot be empty');
    });

    it('should return 404 for non-existent todo', async () => {
      const updatedData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put('/api/items/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Todo not found');
    });

    it('should reject request without auth token', async () => {
      const updatedData = {
        title: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/items/${todoToUpdate.id}`)
        .send(updatedData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });

    it('should prevent updating todos from other users', async () => {
      // Login as different user
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: 'user',
          password: 'password'
        });

      const otherUserToken = loginResponse.body.token;

      const updatedData = {
        title: 'Unauthorized Update Attempt'
      };

      const response = await request(app)
        .put(`/api/items/${todoToUpdate.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(updatedData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Todo not found');
    });
  });

  describe('DELETE /api/items/:id', () => {
    let todoToDelete;

    beforeEach(async () => {
      // Create a fresh todo to delete for each test
      const createResponse = await request(app)
        .post('/api/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Todo to Delete' });
      
      todoToDelete = createResponse.body;
    });

    it('should delete existing todo', async () => {
      const response = await request(app)
        .delete(`/api/items/${todoToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Todo deleted successfully');
      expect(response.body.todo.id).toBe(todoToDelete.id);

      // Verify todo is actually deleted
      const getResponse = await request(app)
        .get('/api/items')
        .set('Authorization', `Bearer ${authToken}`);

      const deletedTodo = getResponse.body.find(todo => todo.id === todoToDelete.id);
      expect(deletedTodo).toBeUndefined();
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .delete('/api/items/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Todo not found');
    });

    it('should reject request without auth token', async () => {
      const response = await request(app)
        .delete(`/api/items/${todoToDelete.id}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access token required');
    });

    it('should prevent deleting todos from other users', async () => {
      // Login as different user
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          username: 'user',
          password: 'password'
        });

      const otherUserToken = loginResponse.body.token;

      const response = await request(app)
        .delete(`/api/items/${todoToDelete.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Todo not found');

      // Verify todo still exists for original user
      const getResponse = await request(app)
        .get('/api/items')
        .set('Authorization', `Bearer ${authToken}`);

      const todoStillExists = getResponse.body.find(todo => todo.id === todoToDelete.id);
      expect(todoStillExists).toBeDefined();
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });
  });
});