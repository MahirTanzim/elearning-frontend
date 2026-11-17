import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import OAuthSuccessPage from './pages/OAuthSuccessPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import BecomeInstructorPage from './pages/BecomeInstructorPage'
import AdminApplicationDetailPage from './pages/AdminApplicationDetailPage'
import AdminApplicationsPage from './pages/AdminApplicationsPage'
import PublicInstructorPage from './pages/PublicInstructorPage'
import PublicInstructorsPage from './pages/PublicInstructorsPage'
import CourseEditorPage from './pages/CourseEditorPage'
import InstructorCoursesPage from './pages/InstructorCoursesPage'
import { useAuth } from './auth/AuthContext'
import './App.css'

function AppHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-brand" to="/">
          <span className="site-brand__mark">L</span>
          <span>Learnly</span>
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/instructors">Instructors</NavLink>
          {user ? (
            <>
              <NavLink to="/profile">My profile</NavLink>
              <button className="site-nav__logout" type="button" onClick={logout}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link className="site-nav__signup" to="/register">Get started</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function WorkspaceSidebar() {
  const { user } = useAuth()
  const location = useLocation()
  const isWorkspace = /^\/(profile|admin|instructor|become-instructor)/.test(location.pathname)

  if (!isWorkspace || !user) return null

  return (
    <aside className="workspace-sidebar">
      <p className="workspace-sidebar__eyebrow">Workspace</p>
      <nav aria-label="Workspace navigation">
        <NavLink to="/profile">My profile</NavLink>
        {user.roles.includes('INSTRUCTOR') && <NavLink to="/instructor/courses">My courses</NavLink>}
        {!user.roles.includes('INSTRUCTOR') && <NavLink to="/become-instructor">Become an instructor</NavLink>}
        {user.roles.includes('ADMIN') && <NavLink to="/admin" end>Admin area</NavLink>}
        {user.roles.includes('ADMIN') && (
          <NavLink to="/admin/instructor-applications">Instructor applications</NavLink>
        )}
      </nav>
    </aside>
  )
}

function App() {
  const { user } = useAuth()
  const location = useLocation()
  const isWorkspace = /^\/(profile|admin|instructor|become-instructor)/.test(location.pathname)

  return (
    <div className="app-shell">
      <AppHeader />
      <div className={`site-main${isWorkspace && user ? ' site-main--workspace' : ''}`}>
        <WorkspaceSidebar />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/instructors" element={<PublicInstructorsPage />} />
            <Route path="/instructors/:id" element={<PublicInstructorPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/oauth2/success" element={<OAuthSuccessPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/become-instructor" element={<BecomeInstructorPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route element={<ProtectedRoute roles={['ADMIN']} />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/instructor-applications" element={<AdminApplicationsPage />} />
              <Route path="/admin/instructor-applications/:id" element={<AdminApplicationDetailPage />} />
            </Route>
            <Route element={<ProtectedRoute roles={['INSTRUCTOR']} />}>
              <Route path="/instructor/courses" element={<InstructorCoursesPage />} />
              <Route path="/instructor/courses/new" element={<CourseEditorPage key="new" />} />
              <Route path="/instructor/courses/:id" element={<CourseEditorPage key="edit" />} />
            </Route>
          </Routes>
        </main>
      </div>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <Link className="site-brand site-brand--footer" to="/">
            <span className="site-brand__mark">L</span>
            <span>Learnly</span>
          </Link>
          <span>Keep learning, one step at a time.</span>
          <Link to="/instructors">Meet our instructors</Link>
        </div>
      </footer>
    </div>
  )
}

export default App