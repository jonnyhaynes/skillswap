import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/components/layout/RootLayout'
import { HomePage } from '@/pages/HomePage'
import { BrowseSkillsPage } from '@/pages/BrowseSkillsPage'
import { SkillDetailPage } from '@/pages/SkillDetailPage'
import { CreateListingPage } from '@/pages/CreateListingPage'
import { EditListingPage } from '@/pages/EditListingPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { EditProfilePage } from '@/pages/EditProfilePage'
import { MyListingsPage } from '@/pages/MyListingsPage'
import { SwapsPage } from '@/pages/SwapsPage'
import { SwapDetailPage } from '@/pages/SwapDetailPage'
import { MessagesPage } from '@/pages/MessagesPage'
import { ConversationPage } from '@/pages/ConversationPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'browse', Component: BrowseSkillsPage },
      { path: 'skills/new', Component: CreateListingPage },
      { path: 'skills/:skillId', Component: SkillDetailPage },
      { path: 'skills/:skillId/edit', Component: EditListingPage },
      { path: 'profile/edit', Component: EditProfilePage },
      { path: 'profile/:userId', Component: ProfilePage },
      { path: 'my-listings', Component: MyListingsPage },
      { path: 'swaps', Component: SwapsPage },
      { path: 'swaps/:swapId', Component: SwapDetailPage },
      { path: 'messages', Component: MessagesPage },
      { path: 'messages/:conversationId', Component: ConversationPage },
      { path: '*', Component: NotFoundPage },
    ],
  },
])
