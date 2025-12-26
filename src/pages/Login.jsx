import React, { useState, useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext';
import axios from 'axios'
import { toast } from 'react-toastify'
import { useLocation, useNavigate } from 'react-router-dom';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  // 👇 Location se ProtectedRoute ka msg catch karenge
  const location = useLocation();
  const msg = location.state?.msg || "";

  // Handle Admin Login Click - Direct redirect
  const handleAdminLogin = () => {
    toast.info("Redirecting to Admin Login...");
    window.location.href = "http://localhost:5174/login"; // seller login route
  };

  const onSubmitHandler = async (event) => {
    console.log("Form submitted");
    event.preventDefault();
    try {
      // --- USER SIGN UP ---
      if (currentState === 'Sign up') {
        const response = await axios.post(backendUrl + '/api/user/register', { name, email, password });
        console.log("Register Response:", response.data);  // Debugging log
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);

          // Save user as well
          if (response.data.user) {
            console.log("Saving User Data to LocalStorage:", response.data.user);  // Debugging log
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } else {
          toast.error(response.data.message);
        }
      }
      // --- USER LOGIN ---
      else {
        const response = await axios.post(backendUrl + '/api/user/login', { email, password });
        console.log("Login Response:", response.data);  // Debugging log
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);

          // Save user as well
          if (response.data.user) {
            console.log("Saving User Data to LocalStorage:", response.data.user);  // Debugging log
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // also store userId (optional but keeps older code working)
            if (response.data.user && response.data.user._id) {
              localStorage.setItem('userId', response.data.user._id);
            }
          }
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log("Error:", error);  // Debugging log
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token && currentState !== 'Admin') {
      navigate('/Ecom')
    }
  }, [token, navigate, currentState])

  return (
    <form
      onSubmit={onSubmitHandler}
      className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'
    >
      <div className='inline-flex items-center gap-2 mb-2 mt-10'>
        <p className='prata-regular text-3xl'>{currentState}</p>
        <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
      </div>

      {/* 👇 Dynamic message */}
      {msg && <p className="text-red-500 text-sm">{msg}</p>}

      {/* Show Name input only in Sign Up */}
      {currentState === 'Sign up' && (
        <input
          onChange={(e) => setName(e.target.value)}
          type="text"
          className='w-full px-3 py-2 border border-gray-800'
          placeholder='Name'
          required
        />
      )}

      <input
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        className='w-full px-3 py-2 border border-gray-800'
        placeholder='Email'
        required
      />
      <input
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        className='w-full px-3 py-2 border border-gray-800'
        placeholder='Password'
        required
      />

      <div className='w-full flex justify-between text-sm mt-[-8px]'>
        <p onClick={() => navigate('/forgot-password')} className='cursor-pointer'>Forgot password?</p>
        {currentState === 'Login' && (
          <p onClick={() => setCurrentState('Sign up')} className='cursor-pointer'>Create account</p>
        )}
        {currentState === 'Sign up' && (
          <p onClick={() => setCurrentState('Login')} className='cursor-pointer'>Login</p>
        )}
        {/* Admin login link - directly redirects */}
        <p 
          onClick={handleAdminLogin} 
          className='cursor-pointer text-blue-600 hover:text-blue-800'
        >
          Login as Admin
        </p>
      </div>

      <button
        type='submit'
        className='bg-black text-white font-light px-8 py-2 mt-4 rounded-[20px]'
      >
        {currentState === 'Login' ? 'Sign in' : currentState === 'Sign up' ? 'Sign up' : 'Admin Sign in'}
      </button>
    </form>
  )
}

export default Login