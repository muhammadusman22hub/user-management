import { useState } from 'react';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h2>Forgot Password</h2>
      <input placeholder="Your email" onChange={(e) => setEmail(e.target.value)} /><br/>
      <button onClick={handleSubmit}>Send Reset Link</button>
      <p>{message}</p>
    </div>
  );
}