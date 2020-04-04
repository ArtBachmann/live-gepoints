import { createContext } from 'react'

// Context contains state (at creation phase it is called initial state).
const Context = createContext({
  currentUser: null,
  isAuth: false,
  draft: null,
  pins: []
})

export default Context