import { Link } from 'react-router-dom'

function Header({ title, subtitle, eyebrow }) {
  return (
    <header className="page-header">
      <Link className="app-logo-link" to="/">
        <img src="/IM_OK.svg" alt="IM OK logo" className="app-logo" />
      </Link>

      <div className="page-title-group">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1 className="page-title">{title}</h1>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
    </header>
  )
}

export default Header
