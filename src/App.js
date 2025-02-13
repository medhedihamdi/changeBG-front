import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // استخدام jwt-decode
import './App.css';

const apiUrl = 'http://localhost:4000';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const navigate = useNavigate();

  const register = async () => {
    try {
      const response = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.text();
        alert(data);
      } else {
        const data = await response.json();
        alert('Registration successful!');
      }
    } catch (error) {
      alert('An error occurred during registration');
    }
  };

  const login = async () => {
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.text();
        alert(data);
      } else {
        const data = await response.json();
        const token = data.token;
        setToken(token);
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
        navigate('/protected');
      }
    } catch (error) {
      alert('An error occurred during login');
    }
  };

  const sayHello = () => {
    const decoded = parseJwt(token);
    alert(`Hello, ${decoded.username}`);
  };

  const changeBackground = () => {
    const decoded = parseJwt(token);
    if (decoded.role === 'admin' || (decoded.permissions && decoded.permissions.includes('changeBackground'))) {
      document.body.style.backgroundColor = 'blue';
    } else {
      alert('You are not authorized to use this button');
    }
  };

  const goToAdminDashboard = async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}` // إرسال التوكن في الهيدر
        }
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('users', JSON.stringify(data.users));
        navigate('/admin');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('An error occurred while accessing admin dashboard');
    }
  };

  const logout = () => {
    setToken('');
    setIsLoggedIn(false);
    localStorage.removeItem('token'); // إزالة التوكن عند تسجيل الخروج
    navigate('/'); // Redirect to home page
  };

  const parseJwt = (token) => {
    return jwtDecode(token);
  };

  const handleGoBack = () => {
    document.body.style.backgroundColor = '';
    navigate('/protected');
  };

  return (
    <div className="App">
      <nav id="nav">
        <div id="l-n"> 
          <a href="/">Home</a>
          <a href="/contact">Contact</a>
        </div>
        <div id="r-n">
          {isLoggedIn ? (
            <div>
              <a id="logout" onClick={logout}>Logout</a>
            </div>
          ) : (
            <a href="/register">Register</a>
          )}
        </div>
      </nav>
      <Routes>
        {!isLoggedIn ? (
          <Route
            path="/"
            element={
              <div>
                <h1>Welcome</h1>
              </div>
            }
          />
        ) : null}
        <Route
          path="/register"
          element={
            <div>
              <h2>Register</h2>
              <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
              <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
              <button onClick={register}>Register</button>
              <h2>Login</h2>
              <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
              <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
              <button onClick={login}>Login</button>
            </div>
          }
        />
        <Route
          path="/protected"
          element={<ProtectedSection sayHello={sayHello} goToAdminDashboard={goToAdminDashboard} changeBackground={changeBackground} />}
        />
        <Route path="/admin" element={<AdminDashboard goBack={handleGoBack} />} />
        <Route path="/contact" element={<div>Contact us</div>} />
      </Routes>
    </div>
  );
}

const ProtectedSection = ({ sayHello, goToAdminDashboard, changeBackground }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  useEffect(() => {
    if (!token) {
      navigate('/register'); // إعادة التوجيه إذا لم يكن المستخدم مسجل دخول
    } else {
      setIsLoggedIn(true);
    }
  }, [token, navigate]);

  return isLoggedIn ? (
    <div>
      <h2>Protected Page</h2>
      <button onClick={sayHello}>Say Hello</button>
      <button onClick={goToAdminDashboard}>Admin Dashboard</button>
      <button onClick={changeBackground}>Change Background</button>
    </div>
  ) : null;
};

const AdminDashboard = ({ goBack }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/register'); // إعادة التوجيه إذا لم يكن المستخدم مسجل دخول
    } else {
      const fetchUsers = () => {
        const usersList = JSON.parse(localStorage.getItem('users'));
        setUsers(usersList);
      };
      fetchUsers();
    }
  }, [token, navigate]);

  const authorizeUser = async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/authorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // إرسال التوكن في الهيدر
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('User authorized successfully');
        window.location.reload();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('An error occurred while authorizing user');
    }
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div>
        <h3>Users List</h3>
        {users.map((user) => (
          <div key={user.username}>
            <p>Username: {user.username}, Role: {user.role}, Permissions: {user.permissions.join(', ')}</p>
          </div>
        ))}
        <select onChange={(e) => setUsername(e.target.value)}>
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.username} value={user.username}>
              {user.username}
            </option>
          ))}
        </select>
        <button onClick={authorizeUser}>Authorize User</button>
      </div>
      <button onClick={goBack}>Go Back</button>
    </div>
  );
};

export default App;
