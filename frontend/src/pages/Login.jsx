import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiError, login, register } from '../api'

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
}

function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const isRegistering = mode === 'register'

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (isRegistering) {
        const data = await register(form)
        localStorage.setItem('tripSplitterClientId', data.user_id)
        navigate(`/home/${data.user_id}`)
      } else {
        const data = await login(form.email)
        const clientId = data.user.clientid
        localStorage.setItem('tripSplitterClientId', clientId)
        navigate(`/home/${clientId}`)
      }
    } catch (submitError) {
      setError(getApiError(submitError, 'Unable to sign you in.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <div className="brand-lockup">
          <div className="brand-mark">TS</div>
          <div>
            <p className="eyebrow">TripSplitter</p>
            <h1 id="auth-title">{isRegistering ? 'Create your account' : 'Welcome back'}</h1>
          </div>
        </div>

        <div className="segmented-control" role="tablist" aria-label="Authentication mode">
          <button
            className={mode === 'login' ? 'active' : ''}
            type="button"
            onClick={() => setMode('login')}
          >
            Log in
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            type="button"
            onClick={() => setMode('register')}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-grid two-column">
              <label>
                First name
                <input
                  autoComplete="given-name"
                  required
                  value={form.firstName}
                  onChange={(event) => updateField('firstName', event.target.value)}
                />
              </label>
              <label>
                Last name
                <input
                  autoComplete="family-name"
                  required
                  value={form.lastName}
                  onChange={(event) => updateField('lastName', event.target.value)}
                />
              </label>
            </div>
          )}

          <label>
            Email
            <input
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              required
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </label>

          {error && <p className="form-message error">{error}</p>}

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Working...' : isRegistering ? 'Create account' : 'Log in'}
          </button>
        </form>
      </section>

      <aside className="auth-aside" aria-label="TripSplitter summary">
        <div className="stat-row">
          <span>Total trip cost</span>
          <strong>$1,248.40</strong>
        </div>
        <div className="mini-ledger">
          <div>
            <span>Flights</span>
            <b>$640.00</b>
          </div>
          <div>
            <span>Dinner</span>
            <b>$188.40</b>
          </div>
          <div>
            <span>Hotel</span>
            <b>$420.00</b>
          </div>
        </div>
        <div className="settlement-preview">
          <span>Simple settlement</span>
          <strong>2 payments</strong>
        </div>
      </aside>
    </main>
  )
}

export default Login
