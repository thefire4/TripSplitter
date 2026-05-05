import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function login(email) {
  const response = await api.post('/auth/login', { email })
  return response.data
}

export async function register({ firstName, lastName, email }) {
  const response = await api.post('/auth/register', { firstName, lastName, email })
  return response.data
}

export async function getTrips(clientId) {
  try {
    const response = await api.get(`/landing_page/${clientId}`)
    return response.data.user ?? []
  } catch (error) {
    if (error.response?.status === 404) {
      return []
    }
    throw error
  }
}

export async function getClients() {
  const response = await api.get('/clients')
  return response.data.clients ?? []
}

export async function getFriends(clientId) {
  const response = await api.get(`/${clientId}/friends`)
  return response.data.friends ?? []
}

export async function addFriend({ clientId, email }) {
  const response = await api.post(`/${clientId}/friends`, { email })
  return response.data
}

export async function createTrip({ clientId, tripName, members }) {
  const response = await api.post('/createtrip', { clientId, tripName, members })
  return response.data
}

export async function updateTrip({ clientId, tripId, tripName, members }) {
  const response = await api.put(`/${clientId}/edittrip/${tripId}`, { tripName, members })
  return response.data
}

export async function deleteTrip({ clientId, tripId }) {
  const response = await api.delete(`/${clientId}/${tripId}`)
  return response.data
}

export async function getTripExpenses({ clientId, tripId }) {
  const response = await api.get(`/trip_expenses/${clientId}/${tripId}`)
  return {
    expenses: response.data.expenses ?? [],
    members: response.data.members ?? [],
  }
}

export async function addExpense({ clientId, tripId, expenseName, amount, description, members }) {
  const response = await api.post(`/${clientId}/${tripId}/addexpense`, {
    expenseName,
    amount,
    description,
    members,
  })
  return response.data
}

export async function deleteExpense({ clientId, expenseId }) {
  const response = await api.delete(`/${clientId}/${expenseId}`)
  return response.data
}

export async function getSettlement(tripId) {
  const response = await api.get(`/settlement/${tripId}`)
  return response.data.transactions ?? []
}

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  return error.response?.data?.error || error.response?.data?.message || error.message || fallback
}
