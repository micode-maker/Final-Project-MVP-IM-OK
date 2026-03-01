import { Link } from 'react-router-dom'

function Header({ title, subtitle }) {
  return (
    <header className="page-header">
      <div className="page-title-group">
        <Link className="app-logo-link" to="/">
          <img src="/IM_OK.svg" alt="IM OK logo" className="app-logo" />
        </Link>

        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
    </header>
  )
}

export default Header
