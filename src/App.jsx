import { Route, Routes } from 'react-router-dom'
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
import AdminApplicationPage from './pages/AdminApplicationsPage'


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/oauth2/success" element={<OAuthSuccessPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path='/become-instructor' element={<BecomeInstructorPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/instructor-applications" element={<AdminApplicationsPage />} />
        <Route path="/admin/instructor-applications/:id" element={<AdminApplicationDetailPage />} />
      </Route>
    </Routes>

  )
}