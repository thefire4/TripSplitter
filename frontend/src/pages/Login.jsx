import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    const response = await axios.post('/api/auth/login', { email: email })
    const clientId = response.data.user.clientid
    navigate(`/home/${clientId}`)
  }

  return (
    <div>
      <h1>Login</h1>
      <input 
        type="text" 
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}

export default Login