import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { addFriend, createTrip, deleteTrip, getApiError, getClients, getFriends, getTrips } from '../api'
import PeopleSelect from '../components/PeopleSelect'
import { displayPerson, getPersonName } from '../format'

function LandingPage() {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [clients, setClients] = useState([])
  const [friends, setFriends] = useState([])
  const [friendEmail, setFriendEmail] = useState('')
  const [tripName, setTripName] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState([])
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const clientIdNumber = useMemo(() => Number(clientId), [clientId])
  const currentClient = clients.find((client) => client.clientid === clientIdNumber)

  useEffect(() => {
    let isMounted = true

    async function loadTrips() {
      setIsLoading(true)
      setStatus({ type: '', message: '' })

      try {
        const [tripData, clientData, friendData] = await Promise.all([
          getTrips(clientIdNumber),
          getClients(),
          getFriends(clientIdNumber),
        ])
        if (isMounted) {
          setTrips(tripData)
          setClients(clientData)
          setFriends(friendData)
        }
      } catch (error) {
        if (isMounted) {
          setStatus({ type: 'error', message: getApiError(error, 'Unable to load trips.') })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadTrips()

    return () => {
      isMounted = false
    }
  }, [clientIdNumber])

  const handleCreateTrip = async (event) => {
    event.preventDefault()
    setStatus({ type: '', message: '' })
    setIsSaving(true)

    try {
      const data = await createTrip({
        clientId: clientIdNumber,
        tripName,
        members: selectedMemberIds,
      })
      setTrips((current) => [...current, { tripid: data.trip_id, tripName }])
      setTripName('')
      setSelectedMemberIds([])
      setStatus({ type: 'success', message: 'Trip created.' })
    } catch (error) {
      setStatus({ type: 'error', message: getApiError(error, 'Unable to create trip.') })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddFriend = async (event) => {
    event.preventDefault()
    setStatus({ type: '', message: '' })

    try {
      const data = await addFriend({ clientId: clientIdNumber, email: friendEmail })
      setFriends((current) => {
        if (current.some((friend) => friend.clientid === data.friend.clientid)) {
          return current
        }

        return [...current, data.friend].sort((first, second) =>
          getPersonName(first).localeCompare(getPersonName(second)),
        )
      })
      setFriendEmail('')
      setStatus({ type: 'success', message: 'Friend added.' })
    } catch (error) {
      setStatus({ type: 'error', message: getApiError(error, 'Unable to add friend.') })
    }
  }

  const handleDeleteTrip = async (tripId) => {
    setStatus({ type: '', message: '' })

    try {
      await deleteTrip({ clientId: clientIdNumber, tripId })
      setTrips((current) => current.filter((trip) => trip.tripid !== tripId))
      setStatus({ type: 'success', message: 'Trip deleted.' })
    } catch (error) {
      setStatus({ type: 'error', message: getApiError(error, 'Unable to delete this trip.') })
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('tripSplitterClientId')
    navigate('/')
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="logo-link" to={`/home/${clientId}`}>
          <span className="brand-mark small">TS</span>
          <span>TripSplitter</span>
        </Link>
        <div className="topbar-actions">
          <span className="client-pill">{displayPerson(getPersonName(currentClient), clientId)}</span>
          <button className="ghost-button" type="button" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <section className="page-heading">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Your trips</h1>
        </div>
        <p>Open a trip to add expenses and calculate who owes who.</p>
      </section>

      <section className="dashboard-grid">
        <div className="stacked-panels">
          <form className="workspace-panel" onSubmit={handleCreateTrip}>
            <div className="panel-header">
              <div>
                <p className="eyebrow">New trip</p>
                <h2>Create a shared ledger</h2>
              </div>
            </div>

            <label>
              Trip name
              <input
                placeholder="Barcelona weekend"
                required
                value={tripName}
                onChange={(event) => setTripName(event.target.value)}
              />
            </label>

            <PeopleSelect
              emptyText="Add friends first, then invite them to this trip."
              label="Add friends to trip"
              people={friends}
              selectedIds={selectedMemberIds}
              onChange={setSelectedMemberIds}
            />

            <button className="primary-button" disabled={isSaving} type="submit">
              {isSaving ? 'Creating...' : 'Create trip'}
            </button>
          </form>

          <section className="workspace-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Friends</p>
                <h2>Your people</h2>
              </div>
            </div>

            {friends.length === 0 ? (
              <div className="empty-state compact">No friends yet. Add someone by email.</div>
            ) : (
              <div className="friend-list">
                {friends.map((friend) => (
                  <div className="friend-row" key={friend.clientid}>
                    <span>{displayPerson(getPersonName(friend), friend.clientid)}</span>
                    <small>{friend.email}</small>
                  </div>
                ))}
              </div>
            )}

            <form className="inline-form" onSubmit={handleAddFriend}>
              <label>
                Friend email
                <input
                  inputMode="email"
                  placeholder="maya@example.com"
                  required
                  type="email"
                  value={friendEmail}
                  onChange={(event) => setFriendEmail(event.target.value)}
                />
              </label>
              <button className="secondary-button" type="submit">
                Add friend
              </button>
            </form>
          </section>
        </div>

        <section className="workspace-panel trips-panel" aria-live="polite">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Active</p>
              <h2>{trips.length} {trips.length === 1 ? 'trip' : 'trips'}</h2>
            </div>
          </div>

          {status.message && <p className={`form-message ${status.type}`}>{status.message}</p>}

          {isLoading ? (
            <div className="empty-state">Loading trips...</div>
          ) : trips.length === 0 ? (
            <div className="empty-state">No trips yet. Create one to start splitting expenses.</div>
          ) : (
            <div className="trip-list">
              {trips.map((trip) => (
                <article className="trip-card" key={trip.tripid}>
                  <Link to={`/home/${clientId}/trips/${trip.tripid}`}>
                    <span>Trip #{trip.tripid}</span>
                    <strong>{trip.tripName}</strong>
                  </Link>
                  <button
                    aria-label={`Delete ${trip.tripName}`}
                    className="icon-button danger"
                    type="button"
                    onClick={() => handleDeleteTrip(trip.tripid)}
                  >
                    x
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default LandingPage
