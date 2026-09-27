
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Log-in";
import ClientHome from "./pages/Client/Home";
import IncidentReport from "./pages/Client/IncidentReport";
import TrackReport from "./pages/Client/TrackReport";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminCaseUpdate from "./pages/Admin/AdminCaseUpdate";
import AuditLog from "./pages/Admin/AuditLog";
import AuditInspectorPreview from "./pages/Admin/AuditInspectorPreview";
import UserManament from "./pages/Admin/UserManament";
import AnalystDashboard from "./pages/Analyst/AnalystDashboard";
import AnalystCaseUpdate from "./pages/Analyst/AnalystCaseUpdate";

function RequireRole({ role }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    const homePath = user.role === "ADMIN"
      ? "/admin"
      : user.role === "INVESTIGATOR"
        ? "/analyst"
        : "/login";
    return <Navigate to={homePath} replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
        <Route path="/" element={<Navigate to="/client" replace />} />

        <Route path="/login" element={
            <div data-portal="login" className="portal-container">
              <Login />
            </div>
          }
        />

        <Route path="/client" 
        element={
            <div data-portal="client" className="portal-container">
              <ClientHome />
            </div>
          }
        />
        <Route path="/client/report" 
        element={
            <div data-portal="client" className="portal-container">
              <IncidentReport />
            </div>
          }
        />
        <Route path="/client/track"
          element={
            <div data-portal="client" className="portal-container">
              <TrackReport />
            </div>
          }
        />

        <Route element={<RequireRole role="ADMIN" />}>
          <Route path="/admin"
            element={
              <div data-portal="admin" className="portal-container">
                <AdminDashboard />
              </div>
            }
          />
          <Route path="/admin/case-update"
            element={
              <div data-portal="admin" className="portal-container">
                <AdminCaseUpdate />
              </div>
            }
          />
          <Route path="/admin/audit"
            element={
              <div data-portal="admin" className="portal-container">
                <AuditLog />
              </div>
            }
          />
          <Route path="/admin/audit-inspector-preview"
            element={
              <div data-portal="admin" className="portal-container">
                <AuditInspectorPreview />
              </div>
            }
          />
          <Route path="/admin/users"
            element={
              <div data-portal="admin" className="portal-container">
                <UserManament />
              </div>
            }
          />
          <Route path="/admin/users/provision"
            element={
              <div data-portal="admin" className="portal-container">
                <UserManament />
              </div>
            }
          />
        </Route>

        <Route element={<RequireRole role="INVESTIGATOR" />}>
          <Route path="/analyst"
            element={
              <div data-portal="analyst" className="portal-container">
                <AnalystDashboard />
              </div>
            }
          />
          <Route path="/analyst/case-update"
            element={
              <div data-portal="analyst" className="portal-container">
                <AnalystCaseUpdate />
              </div>
            }
          />
        </Route>
    </Routes>
  );
}