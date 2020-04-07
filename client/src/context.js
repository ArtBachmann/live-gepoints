import { createContext } from 'react'

// createContext creates Context object and >> useContext uses it when necessary
// Context contains state (at creation phase it is called initial state).
const Context = createContext({
  currentUser: null,
  isAuth: false,
  draft: null,
  pins: [],
  currentPin: null
})

export default Context
