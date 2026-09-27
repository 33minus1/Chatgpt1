import { Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { BottomNav } from './components/BottomNav'
import { HomePage } from './pages/HomePage'
import { JobsPage } from './pages/JobsPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { JobDetailPage } from './pages/JobDetailPage'
import { ApplyPage } from './pages/ApplyPage'
import { MyApplicationsPage } from './pages/MyApplicationsPage'
import { EmployerHomePage } from './pages/EmployerHomePage'
import { EmployerJobsPage } from './pages/EmployerJobsPage'
import { NewEmployerJobPage } from './pages/NewEmployerJobPage'
import { ApplicantsPage } from './pages/ApplicantsPage'
import { ApplicantDetailPage } from './pages/ApplicantDetailPage'
import { LoginPage } from './pages/LoginPage'
import { AccountPage } from './pages/AccountPage'
import { EmployerAccountPage } from './pages/EmployerAccountPage'
import { EmployerApplicantsOverviewPage } from './pages/EmployerApplicantsOverviewPage'
import { AdminHomePage } from './pages/AdminHomePage'
import { AdminJobsPage } from './pages/AdminJobsPage'
import { AdminCompaniesPage } from './pages/AdminCompaniesPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { CompaniesPage } from './pages/CompaniesPage'
import { CompanyDetailPage } from './pages/CompanyDetailPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { AdminReportsPage } from './pages/AdminReportsPage'
import { HelpPage } from './pages/HelpPage'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { Footer } from './components/Footer'
import { DemoModeBanner } from './components/DemoModeBanner'

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <DemoModeBanner />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/apply/:jobId" element={<ApplyPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:id" element={<CompanyDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/my-applications" element={<MyApplicationsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/employer" element={<EmployerHomePage />} />
        <Route path="/employer/jobs" element={<EmployerJobsPage />} />
        <Route path="/employer/applicants" element={<EmployerApplicantsOverviewPage />} />
        <Route path="/employer/jobs/new" element={<NewEmployerJobPage />} />
        <Route path="/employer/jobs/:id/edit" element={<NewEmployerJobPage />} />
        <Route path="/employer/jobs/:id/applicants" element={<ApplicantsPage />} />
        <Route path="/employer/jobs/:id/applicants/:applicantId" element={<ApplicantDetailPage />} />
        <Route path="/employer/account" element={<EmployerAccountPage />} />
        <Route path="/employer/notifications" element={<NotificationsPage employer />} />
        <Route path="/admin" element={<AdminHomePage />} />
        <Route path="/admin/jobs" element={<AdminJobsPage />} />
        <Route path="/admin/companies" element={<AdminCompaniesPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/reports" element={<AdminReportsPage />} />
        <Route path="*" element={<PlaceholderPage title="صفحه پیدا نشد" text="این آدرس وجود ندارد یا هنوز ساخته نشده است." />} />
      </Routes>
      <Footer />
      <BottomNav />
    </div>
  )
}
