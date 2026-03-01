import { NavLink } from 'react-router-dom'

const defaultNavLinks = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/caregiver', label: 'Caregiver' },
  { to: '/profile', label: 'Profile' },
]

function NavButtons({ links = defaultNavLinks }) {
  return (
    <nav aria-label="Main navigation" className="nav-buttons">
      <ul className="nav-list">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              className={({ isActive }) => `nav-button${isActive ? ' is-active' : ''}`}
              to={link.to}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default NavButtons
