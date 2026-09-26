import "../design/ClientHeader.css";
import { useLocation, useNavigate } from "react-router-dom";
import logoIcon from "../../public/Nodeguard Icon.png";
import LogoName from "../../public/Nodeguard Logo.png";


export default function ClientHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { label: "Home", path: "/client" },
    { label: "File a Report", path: "/client/report" },
    { label: "Track Case", path: "/client/track" },
  ];

  return (
    <header className="client-header">
      <div className="logo-container" >
        <img src={logoIcon} alt="" className="client-header-icon" />
        <img src={LogoName} alt="NodeGuard" className="client-header-name" />
      </div>
    
      <nav className="client-navbar" aria-label="Main navigation">
        <span className="client-navbar-pill" aria-hidden="true" />
        {navigationItems.map((item) => (
          <button
            key={item.path}
            className="client-navbar-button"
            aria-current={location.pathname === item.path ? "page" : undefined}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}