import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';


const apiUrl = 'http://localhost:4000';

function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
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
        alert(data);
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
        setToken(data.split(': ')[1]);
        setIsLoggedIn(true); // Set login state to true
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
      const response = await fetch(`${apiUrl}/admin/dashboard?token=${token}`);
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('users', JSON.stringify(data.users));
        localStorage.setItem('token', token);
        navigate('/admin');
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('An error occurred while accessing admin dashboard');
    }
  };

  const parseJwt = (token) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  };

  const handleGoBack = () => {
    // Reset background color and login state
    document.body.style.backgroundColor = '';
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className="App">
      <Routes>
        {!isLoggedIn ? (
          <Route path="/" element={
            <div>
              <h1>Welcome</h1>
              <div>
                <h2>Register</h2>
                <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                <button onClick={register}>Register</button>
              </div>
              <div>
                <h2>Login</h2>
                <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                <button onClick={login}>Login</button>
              </div>
            </div>
          } />
        ) : null}
        <Route path="/protected" element={<ProtectedSection sayHello={sayHello} goToAdminDashboard={goToAdminDashboard} changeBackground={changeBackground} />} />
        <Route path="/admin" element={<AdminDashboard goBack={handleGoBack} />} />
      </Routes>
    </div>
  );
}

const ProtectedSection = ({ sayHello, goToAdminDashboard, changeBackground }) => {
  return (
    <div>
      <h2>Protected Page</h2>
      <button onClick={sayHello}>Say Hello</button>
      <button onClick={goToAdminDashboard}>Admin Dashboard</button>
      <button onClick={changeBackground}>Change Background</button>
    </div>
  );
};

const AdminDashboard = ({ goBack }) => {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUsers = () => {
      const usersList = JSON.parse(localStorage.getItem('users'));
      setUsers(usersList);
    };
    fetchUsers();
  }, []);

  const authorizeUser = async () => {
    try {
      const response = await fetch(`${apiUrl}/admin/authorize?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        {users.map(user => (
          <div key={user.username}>
            <p>Username: {user.username}, Role: {user.role}, Permissions: {user.permissions.join(', ')}</p>
          </div>
        ))}
        <select onChange={(e) => setUsername(e.target.value)}>
          <option value="">Select a user</option>
          {users.map(user => (
            <option key={user.username} value={user.username}>{user.username}</option>
          ))}
        </select>
        <button onClick={authorizeUser}>Authorize User</button>
      </div>
      <button onClick={goBack}>Go Back</button>
    </div>
  );
};

export default SignIn;
