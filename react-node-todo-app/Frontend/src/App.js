import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  // Todo form state
  const [newTodo, setNewTodo] = useState('');
  const [editingTodo, setEditingTodo] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchTodos(token);
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setLoginForm({ username: '', password: '' });
        fetchTodos(data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setTodos([]);
    setError('');
  };

  const fetchTodos = async (token = localStorage.getItem('token')) => {
    try {
      const response = await fetch(`${API_BASE}/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      } else {
        setError('Failed to fetch todos');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: newTodo })
      });

      if (response.ok) {
        const todo = await response.json();
        setTodos([...todos, todo]);
        setNewTodo('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add todo');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      const response = await fetch(`${API_BASE}/items/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ completed: !todo.completed })
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(todos.map(t => t.id === todo.id ? updatedTodo : t));
      } else {
        setError('Failed to update todo');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleEditTodo = async (todo) => {
    if (!editTitle.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/items/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ title: editTitle })
      });

      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(todos.map(t => t.id === todo.id ? updatedTodo : t));
        setEditingTodo(null);
        setEditTitle('');
      } else {
        setError('Failed to update todo');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleDeleteTodo = async (todo) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;

    try {
      const response = await fetch(`${API_BASE}/items/${todo.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setTodos(todos.filter(t => t.id !== todo.id));
      } else {
        setError('Failed to delete todo');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const startEdit = (todo) => {
    setEditingTodo(todo.id);
    setEditTitle(todo.title);
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setEditTitle('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Todo App Login
          </h1>
          
          {error && (
            <div data-testid="error-message" className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div data-testid="login-form">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                data-testid="username-input"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                data-testid="password-input"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                required
                disabled={loading}
              />
            </div>
            
            <button
              type="button"
              data-testid="login-button"
              disabled={loading}
              onClick={handleLogin}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>Demo credentials:</p>
            <p>Username: <strong>admin</strong> | Password: <strong>password</strong></p>
            <p>Username: <strong>user</strong> | Password: <strong>password</strong></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Todo List</h1>
              <p className="text-gray-600">Welcome, {user.username}!</p>
            </div>
            <button
              onClick={handleLogout}
              data-testid="logout-button"
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div data-testid="error-message" className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Add Todo Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div data-testid="add-todo-form" className="flex gap-2">
            <input
              type="text"
              data-testid="new-todo-input"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              disabled={loading}
            />
            <button
              type="button"
              data-testid="add-todo-button"
              disabled={loading || !newTodo.trim()}
              onClick={handleAddTodo}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>

        {/* Todo List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Todos</h2>
          
          {todos.length === 0 ? (
            <p data-testid="no-todos-message" className="text-gray-500 text-center py-8">
              No todos yet. Add one above!
            </p>
          ) : (
            <div data-testid="todos-list" className="space-y-2">
              {todos.map(todo => (
                <div
                  key={todo.id}
                  data-testid={`todo-item-${todo.id}`}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    data-testid={`todo-checkbox-${todo.id}`}
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo)}
                    className="w-5 h-5 text-blue-600"
                  />
                  
                  {editingTodo === todo.id ? (
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        data-testid={`edit-todo-input-${todo.id}`}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleEditTodo(todo)}
                      />
                      <button
                        data-testid={`save-edit-button-${todo.id}`}
                        onClick={() => handleEditTodo(todo)}
                        className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        data-testid={`cancel-edit-button-${todo.id}`}
                        onClick={cancelEdit}
                        className="bg-gray-500 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span
                        data-testid={`todo-title-${todo.id}`}
                        className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
                      >
                        {todo.title}
                      </span>
                      <button
                        data-testid={`edit-button-${todo.id}`}
                        onClick={() => startEdit(todo)}
                        className="bg-yellow-500 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        data-testid={`delete-button-${todo.id}`}
                        onClick={() => handleDeleteTodo(todo)}
                        className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;