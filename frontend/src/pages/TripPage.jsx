import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  addExpense,
  deleteExpense,
  getApiError,
  getClients,
  getFriends,
  getSettlement,
  getTripExpenses,
  getTrips,
  updateTrip,
} from '../api'
import PeopleSelect from '../components/PeopleSelect'
import { displayPerson, getPersonName } from '../format'

const emptyExpense = {
  expenseName: '',
  amount: '',
  description: '',
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

function TripPage() {
  const { clientId, tripId } = useParams()
  const clientIdNumber = useMemo(() => Number(clientId), [clientId])
  const tripIdNumber = useMemo(() => Number(tripId), [tripId])
  const [tripName, setTripName] = useState('')
  const [clients, setClients] = useState([])
  const [friends, setFriends] = useState([])
  const [tripMembers, setTripMembers] = useState([])
  const [selectedTripMemberIds, setSelectedTripMemberIds] = useState([])
  const [selectedExpenseMemberIds, setSelectedExpenseMemberIds] = useState([])
  const [expenses, setExpenses] = useState([])
  const [transactions, setTransactions] = useState([])
  const [expenseForm, setExpenseForm] = useState(emptyExpense)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingExpense, setIsSavingExpense] = useState(false)
  const [isSavingTrip, setIsSavingTrip] = useState(false)

  const total = expenses.reduce((sum, expense) => sum + Number(expense.expensePrice || 0), 0)
  const currentClient = clients.find((client) => client.clientid === clientIdNumber)

  const fetchTripData = useCallback(async () => {
    const [trips, expenseData, settlementData, clientData, friendData] = await Promise.all([
      getTrips(clientIdNumber),
      getTripExpenses({ clientId: clientIdNumber, tripId: tripIdNumber }),
      getSettlement(tripIdNumber),
      getClients(),
      getFriends(clientIdNumber),
    ])
    const currentTrip = trips.find((trip) => trip.tripid === tripIdNumber)

    return {
      name: currentTrip?.tripName || `Trip #${tripId}`,
      expenses: expenseData.expenses,
      members: expenseData.members,
      clients: clientData,
      friends: friendData,
      transactions: settlementData,
    }
  }, [clientIdNumber, tripId, tripIdNumber])

  const applyTripData = useCallback(({ name, expenses: expenseData, members, clients: clientData, friends: friendData, transactions: settlementData }) => {
    setTripName(name)
    setClients(clientData)
    setFriends(friendData)
    setExpenses(expenseData)
    setTripMembers(members)
    setSelectedTripMemberIds(members.map((member) => member.clientid))
    setSelectedExpenseMemberIds((current) => {
      if (current.length > 0) {
        return current.filter((memberId) => members.some((member) => member.clientid === memberId))
      }

      return members.map((member) => member.clientid)
    })
    setTransactions(settlementData)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadInitialTrip() {
      try {
        const tripData = await fetchTripData()
        if (isMounted) {
          applyTripData(tripData)
        }
      } catch (error) {
        if (isMounted) {
          setStatus({ type: 'error', message: getApiError(error, 'Unable to load this trip.') })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadInitialTrip()

    return () => {
      isMounted = false
    }
  }, [applyTripData, clientIdNumber, fetchTripData, tripIdNumber])

  const refreshTrip = async () => {
    setIsLoading(true)
    const tripData = await fetchTripData()
    applyTripData(tripData)
    setIsLoading(false)
  }

  const updateExpenseField = (field, value) => {
    setExpenseForm((current) => ({ ...current, [field]: value }))
  }

  const handleAddExpense = async (event) => {
    event.preventDefault()
    setStatus({ type: '', message: '' })
    setIsSavingExpense(true)

    try {
      await addExpense({
        clientId: clientIdNumber,
        tripId: tripIdNumber,
        expenseName: expenseForm.expenseName,
        amount: Number(expenseForm.amount),
        description: expenseForm.description,
        members: selectedExpenseMemberIds,
      })
      setExpenseForm(emptyExpense)
      setStatus({ type: 'success', message: 'Expense added.' })
      await refreshTrip()
    } catch (error) {
      setStatus({ type: 'error', message: getApiError(error, 'Unable to add expense.') })
    } finally {
      setIsSavingExpense(false)
    }
  }

  const handleUpdateTrip = async (event) => {
    event.preventDefault()
    setStatus({ type: '', message: '' })
    setIsSavingTrip(true)

    try {
      await updateTrip({
        clientId: clientIdNumber,
        tripId: tripIdNumber,
        tripName,
        members: selectedTripMemberIds,
      })
      setStatus({ type: 'success', message: 'Trip updated.' })
      await refreshTrip()
    } catch (error) {
      setStatus({ type: 'error', message: getApiError(error, 'Unable to update trip.') })
    } finally {
      setIsSavingTrip(false)
    }
  }

  const handleDeleteExpense = async (expenseId) => {
    setStatus({ type: '', message: '' })

    try {
      await deleteExpense({ clientId: clientIdNumber, expenseId })
      setStatus({ type: 'success', message: 'Expense deleted.' })
      await refreshTrip()
    } catch (error) {
      setStatus({ type: 'error', message: getApiError(error, 'Unable to delete this expense.') })
    }
  }

  const tripMemberChoices = [...friends]
  tripMembers.forEach((member) => {
    if (!tripMemberChoices.some((person) => person.clientid === member.clientid)) {
      tripMemberChoices.push(member)
    }
  })

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="logo-link" to={`/home/${clientId}`}>
          <span className="brand-mark small">TS</span>
          <span>Trips</span>
        </Link>
        <span className="client-pill">{displayPerson(getPersonName(currentClient), clientId)}</span>
      </header>

      <section className="page-heading trip-heading">
        <div>
          <p className="eyebrow">Trip #{tripId}</p>
          <h1>{tripName}</h1>
        </div>
        <div className="total-pill">
          <span>Total expenses</span>
          <strong>{formatMoney(total)}</strong>
        </div>
      </section>

      {status.message && <p className={`form-message ${status.type}`}>{status.message}</p>}

      <section className="trip-workspace">
        <div className="stacked-panels">
          <section className="workspace-panel settlement-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Settlement</p>
                <h2>Who pays who</h2>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="empty-state">No payments needed yet.</div>
            ) : (
              <div className="settlement-list">
                {transactions.map((transaction) => (
                  <div className="settlement-row" key={`${transaction.from}-${transaction.to}-${transaction.amount}`}>
                    <span>{displayPerson(transaction.fromName, transaction.from)}</span>
                    <strong>{formatMoney(transaction.amount)}</strong>
                    <span>{displayPerson(transaction.toName, transaction.to)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <form className="workspace-panel" onSubmit={handleAddExpense}>
            <div className="panel-header">
              <div>
                <p className="eyebrow">Expense</p>
                <h2>Add a cost</h2>
              </div>
            </div>

            <label>
              Name
              <input
                placeholder="Dinner"
                required
                value={expenseForm.expenseName}
                onChange={(event) => updateExpenseField('expenseName', event.target.value)}
              />
            </label>

            <label>
              Amount
              <input
                inputMode="decimal"
                min="0.01"
                required
                step="0.01"
                type="number"
                value={expenseForm.amount}
                onChange={(event) => updateExpenseField('amount', event.target.value)}
              />
            </label>

            <PeopleSelect
              emptyText="Add members to this trip before splitting an expense."
              label="Split with"
              people={tripMembers}
              selectedIds={selectedExpenseMemberIds}
              onChange={setSelectedExpenseMemberIds}
            />

            <label>
              Description
              <textarea
                placeholder="What was this for?"
                required
                value={expenseForm.description}
                onChange={(event) => updateExpenseField('description', event.target.value)}
              />
            </label>

            <button className="primary-button" disabled={isSavingExpense} type="submit">
              {isSavingExpense ? 'Adding...' : 'Add expense'}
            </button>
          </form>

          <form className="workspace-panel" onSubmit={handleUpdateTrip}>
            <div className="panel-header">
              <div>
                <p className="eyebrow">Settings</p>
                <h2>Edit trip</h2>
              </div>
            </div>

            <label>
              Trip name
              <input
                required
                value={tripName}
                onChange={(event) => setTripName(event.target.value)}
              />
            </label>

            <PeopleSelect
              emptyText="No members found for this trip."
              label="Add friends to trip"
              people={tripMemberChoices}
              selectedIds={selectedTripMemberIds}
              onChange={setSelectedTripMemberIds}
            />

            <button className="secondary-button" disabled={isSavingTrip} type="submit">
              {isSavingTrip ? 'Saving...' : 'Save trip'}
            </button>
          </form>
        </div>

        <section className="workspace-panel ledger-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Ledger</p>
              <h2>Expenses</h2>
            </div>
          </div>

          {isLoading ? (
            <div className="empty-state">Loading ledger...</div>
          ) : expenses.length === 0 ? (
            <div className="empty-state">No expenses yet. Add the first cost for this trip.</div>
          ) : (
            <div className="expense-table">
              <div className="expense-row header">
                <span>Name</span>
                <span>Paid by</span>
                <span>Amount</span>
                <span></span>
              </div>
              {expenses.map((expense) => (
                <div className="expense-row" key={expense.expenseid}>
                  <strong>{expense.expenseName}</strong>
                  <span>{displayPerson(expense.paidByName, expense.paidBy)}</span>
                  <span>{formatMoney(expense.expensePrice)}</span>
                  <button
                    aria-label={`Delete ${expense.expenseName}`}
                    className="icon-button danger"
                    type="button"
                    onClick={() => handleDeleteExpense(expense.expenseid)}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default TripPage
