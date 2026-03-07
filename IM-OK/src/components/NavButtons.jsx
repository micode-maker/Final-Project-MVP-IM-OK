import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

const privateNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/caregiver', label: 'Caregiver' },
  { to: '/profile', label: 'Profile' },
]

const publicNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/auth/login', label: 'Login' },
  { to: '/auth/register', label: 'Register' },
]

function NavButtons({ links }) {
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()

  const activeLinks = links ?? (isAuthenticated ? privateNavLinks : publicNavLinks)

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  return (
    <nav aria-label="Main navigation" className="nav-buttons">
      <ul className="nav-list">
        {activeLinks.map((link) => (
          <li key={link.to}>
            <NavLink
              className={({ isActive }) => `nav-button${isActive ? ' is-active' : ''}`}
              to={link.to}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
        {isAuthenticated ? (
          <li>
            <button className="nav-button nav-button-logout" onClick={handleLogout} type="button">
              Logout
            </button>
          </li>
        ) : null}
      </ul>
    </nav>
  )
}

export default NavButtons
