import "../design/AdminHeader.css";
import { useLocation, useNavigate } from "react-router-dom";
import logoIcon from "../../public/Nodeguard Icon.png";
import LogoName from "../../public/Nodeguard Logo.png";
import iconDashboard from "../../public/layout-dashboard.png";
import iconUser from "../../public/layout-user.png";
import iconHelpCircle from "../../public/layout-custody.png";
const avatar = "https://www.figma.com/api/mcp/asset/25ddeda4-f3be-4366-9a45-39db2f40bf21.png";

const NAVIGATION_ITEMS = [
    { label: "Dashboard", path: "/admin", icon: iconDashboard },
    { label: "User Management", path: "/admin/users", icon: iconUser },
    { label: "Chain-of-Custody Log", path: "/admin/audit", icon: iconHelpCircle },
  ];

export default function AdminHeader({
  items = NAVIGATION_ITEMS,
    user = {  name: "System Administrator", email: "admin@nodeguard.local", avatar },
    }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="admin-header">
      <div className="logo-container">
        <img src={logoIcon} alt="" className="client-header-icon" />
        <img src={LogoName} alt="NodeGuard" className="client-header-name" />
      </div>

    <nav className="nav-container" aria-label="Admin navigation">
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

    <section className="user-info">
        <img src={user.avatar} alt="" className="user-avatar" />
        <div className="user-details">
          <span className="user-name">{user.name}</span>
          <span className="user-email">{user.email}</span>
        </div>
      </section>
      
    </header>
  );
}
