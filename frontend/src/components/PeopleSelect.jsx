import { displayPerson, getPersonName } from '../format'

function PeopleSelect({ label, people, selectedIds, onChange, emptyText = 'No people available' }) {
  const selectedPeople = people.filter((person) => selectedIds.includes(person.clientid))
  const summary =
    selectedPeople.length > 0
      ? selectedPeople.map((person) => displayPerson(getPersonName(person), person.clientid)).join(', ')
      : 'Select people'

  const togglePerson = (personId) => {
    if (selectedIds.includes(personId)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== personId))
      return
    }

    onChange([...selectedIds, personId])
  }

  return (
    <div className="people-field">
      <span className="field-label">{label}</span>
      <details className="people-menu">
        <summary>
          <span>{summary}</span>
          <b>{selectedPeople.length}</b>
        </summary>
        <div className="people-options">
          {people.length === 0 ? (
            <p>{emptyText}</p>
          ) : (
            people.map((person) => (
              <label className="check-row" key={person.clientid}>
                <input
                  checked={selectedIds.includes(person.clientid)}
                  type="checkbox"
                  onChange={() => togglePerson(person.clientid)}
                />
                <span>
                  <strong>{displayPerson(getPersonName(person), person.clientid)}</strong>
                  <small>{person.email || `Client #${person.clientid}`}</small>
                </span>
              </label>
            ))
          )}
        </div>
      </details>
    </div>
  )
}

export default PeopleSelect
