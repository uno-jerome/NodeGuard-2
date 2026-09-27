import "../design/AnalystHeader.css";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogIn, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logoIcon from "../../public/Nodeguard Icon.png";
import LogoName from "../../public/Nodeguard Logo.png";
import iconDashboard from "../../public/layout-dashboard.png";
import iconCaseUpdate from "../../public/layout-custody.png";
const avatar = "https://www.figma.com/api/mcp/asset/25ddeda4-f3be-4366-9a45-39db2f40bf21.png";

const NAVIGATION_ITEMS = [
  { label: "Case", path: "/analyst/case-update", icon: iconCaseUpdate },
  { label: "Dashboard", path: "/analyst", icon: iconDashboard },
  ];

export default function AnalystHeader({ items = NAVIGATION_ITEMS }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="analyst-header">
      <div className="logo-container">
        <img src={logoIcon} alt="" className="client-header-icon" />
        <img src={LogoName} alt="NodeGuard" className="client-header-name" />
      </div>

    <nav className="nav-container" aria-label="Analyst navigation">
        {items.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <img src={item.icon} alt="" className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {isAuthenticated ? (
        <details className="analyst-profile-menu">
          <summary className="user-info" aria-label="Open profile menu">
            <img src={user.avatar || avatar} alt="" className="user-avatar" />
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
            </div>
            <ChevronDown size={15} aria-hidden="true" />
          </summary>
          <div className="analyst-profile-dropdown">
            <button type="button" onClick={handleLogout}>
              <LogOut size={16} aria-hidden="true" />
              Log Out
            </button>
          </div>
        </details>
      ) : (
        <button className="user-info user-info-login" type="button" onClick={() => navigate("/login")}>
          <LogIn size={17} aria-hidden="true" />
          <span className="user-name">Log In</span>
        </button>
      )}
      
    </header>
  );
}
