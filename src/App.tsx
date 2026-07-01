import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { CourseMapPage } from './pages/CourseMapPage'
import { DashboardPage } from './pages/DashboardPage'

const TopicPage = lazy(() => import('./pages/TopicPage').then((module) => ({ default: module.TopicPage })))
const LibraryPage = lazy(() => import('./pages/LibraryPage').then((module) => ({ default: module.LibraryPage })))
const ProceduresPage = lazy(() => import('./pages/ProceduresPage').then((module) => ({ default: module.ProceduresPage })))
const PracticePage = lazy(() => import('./pages/PracticePage').then((module) => ({ default: module.PracticePage })))
const ExamPage = lazy(() => import('./pages/ExamPage').then((module) => ({ default: module.ExamPage })))
const StartDiagnosticPage = lazy(() => import('./pages/StartDiagnosticPage').then((module) => ({ default: module.StartDiagnosticPage })))
const NotationPage = lazy(() => import('./pages/NotationPage').then((module) => ({ default: module.NotationPage })))
const MaterialsPage = lazy(() => import('./pages/MaterialsPage').then((module) => ({ default: module.MaterialsPage })))

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'course-map', element: <CourseMapPage /> },
      { path: 'topic/:slug', element: <TopicPage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'procedures', element: <ProceduresPage /> },
      { path: 'practice', element: <PracticePage /> },
      { path: 'exam', element: <ExamPage /> },
      { path: 'start', element: <StartDiagnosticPage /> },
      { path: 'notation', element: <NotationPage /> },
      { path: 'materials', element: <MaterialsPage /> },
    ],
  },
])

export default function App() {
  return (
    <Suspense fallback={<div className="route-loading" role="status">Opening study view…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
