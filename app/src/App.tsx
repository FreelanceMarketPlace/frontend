import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { JobDetailPage } from './pages/jobs/JobDetailPage'
import { JobListPage } from './pages/jobs/JobListPage'
import { EmployerJobsPage } from './pages/employer/EmployerJobsPage'
import { EmployerContractsPage } from './pages/employer/EmployerContractsPage'
import { JobEditorPage } from './pages/employer/JobEditorPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { FreelancerProposalsPage } from './pages/freelancer/FreelancerProposalsPage'
import { FreelancerOffersPage } from './pages/freelancer/FreelancerOffersPage'
import { FreelancerContractsPage } from './pages/freelancer/FreelancerContractsPage'
import { ContractDashboard } from './pages/contracts/ContractDashboard'
import { MilestoneDetailPage } from './pages/contracts/MilestoneDetailPage'
import { MilestoneSubmitForm } from './pages/contracts/MilestoneSubmitForm'
import { RevisionRequestForm } from './pages/contracts/RevisionRequestForm'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          <Route path="jobs" element={<JobListPage />} />
          <Route path="jobs/:jobId" element={<JobDetailPage />} />

          <Route
            path="freelancer/proposals"
            element={
              <ProtectedRoute roles={['FREELANCER']}>
                <FreelancerProposalsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="freelancer/offers"
            element={
              <ProtectedRoute roles={['FREELANCER']}>
                <FreelancerOffersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="freelancer/contracts"
            element={
              <ProtectedRoute roles={['FREELANCER']}>
                <FreelancerContractsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="employer/jobs"
            element={
              <ProtectedRoute roles={['EMPLOYER']}>
                <EmployerJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="employer/jobs/new"
            element={
              <ProtectedRoute roles={['EMPLOYER']}>
                <JobEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="employer/jobs/:jobId/edit"
            element={
              <ProtectedRoute roles={['EMPLOYER']}>
                <JobEditorPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="employer/contracts"
            element={
              <ProtectedRoute roles={['EMPLOYER']}>
                <EmployerContractsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="admin/users"
            element={
              <ProtectedRoute roles={['ADMIN', 'SUPPORTER']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="contracts/:contractId"
            element={
              <ProtectedRoute roles={['EMPLOYER', 'FREELANCER']}>
                <ContractDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="contracts/:contractId/milestones/:milestoneId"
            element={
              <ProtectedRoute roles={['EMPLOYER', 'FREELANCER']}>
                <MilestoneDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="contracts/:contractId/milestones/:milestoneId/submit"
            element={
              <ProtectedRoute roles={['FREELANCER']}>
                <MilestoneSubmitForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="contracts/:contractId/milestones/:milestoneId/revision"
            element={
              <ProtectedRoute roles={['EMPLOYER']}>
                <RevisionRequestForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="me"
            element={
              <ProtectedRoute>
                <Navigate to="/" replace />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<div style={{ padding: 16 }}>404 Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
