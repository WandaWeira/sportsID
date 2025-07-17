import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { AuthGuard } from "./components/auth/AuthGuard";
import { AppInitializer } from "./components/auth/AppInitializer";
import { Layout } from "./components/layout/Layout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { HomePage } from "./pages/home/HomePage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { ScoutDashboard } from "./pages/scout/ScoutDashboard";
import { CoachDashboard } from "./pages/coach/CoachDashboard";
import { ClubPage } from "./pages/club/ClubPage";
import ClubDashboard from "./pages/club/ClubDashboard";
import ClubManagement from "./pages/club/ClubManagement";
import { MessagesPage } from "./pages/messages/MessagesPage";
import { SearchPage } from "./pages/search/SearchPage";

function App() {
  return (
    <Provider store={store}>
      <AppInitializer>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <AuthGuard>
                    <Layout>
                      <HomePage />
                    </Layout>
                  </AuthGuard>
                }
              />

              <Route
                path="/profile/:id?"
                element={
                  <AuthGuard>
                    <Layout>
                      <ProfilePage />
                    </Layout>
                  </AuthGuard>
                }
              />

              <Route
                path="/scout-dashboard"
                element={
                  <AuthGuard requiredRole="scout">
                    <Layout>
                      <ScoutDashboard />
                    </Layout>
                  </AuthGuard>
                }
              />

              <Route
                path="/coach-dashboard"
                element={
                  <AuthGuard requiredRole="coach">
                    <Layout>
                      <CoachDashboard />
                    </Layout>
                  </AuthGuard>
                }
              />

              <Route
                path="/club/:id"
                element={
                  <AuthGuard>
                    <Layout>
                      <ClubPage />
                    </Layout>
                  </AuthGuard>
                }
              />

              <Route
                path="/club-dashboard"
                element={
                  <AuthGuard>
                    <Layout>
                      <ClubDashboard />
                    </Layout>
                  </AuthGuard>
                }
              />

              <Route
                path="/club-management"
                element={
                  <AuthGuard>
                    <Layout>
                      <ClubManagement />
                    </Layout>
                  </AuthGuard>
                }
              />

              <Route
                path="/messages"
                element={
                  <AuthGuard>
                    <Layout>
                      <MessagesPage />
                    </Layout>
                  </AuthGuard>
                }
              />

              <Route
                path="/search"
                element={
                  <AuthGuard>
                    <Layout>
                      <SearchPage />
                    </Layout>
                  </AuthGuard>
                }
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AppInitializer>
    </Provider>
  );
}

export default App;
