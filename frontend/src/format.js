export function getPersonName(person) {
  return person?.name || `${person?.firstName ?? ''} ${person?.lastName ?? ''}`.trim()
}

export function displayPerson(name, clientId) {
  return name || `Client #${clientId}`
}
