import { RouterProvider } from 'react-router'
import { router } from './router'
import { AuthProvider } from './context/AuthContext'
import { SkillsProvider } from './context/SkillsContext'
import { SwapsProvider } from './context/SwapsContext'
import { MessagesProvider } from './context/MessagesContext'
import { ReviewsProvider } from './context/ReviewsContext'
import { ToastProvider } from './context/ToastContext'

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SkillsProvider>
          <SwapsProvider>
            <MessagesProvider>
              <ReviewsProvider>
                <RouterProvider router={router} />
              </ReviewsProvider>
            </MessagesProvider>
          </SwapsProvider>
        </SkillsProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
