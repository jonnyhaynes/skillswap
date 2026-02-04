import type { Conversation, Message } from '../types';

export const conversations: Conversation[] = [
  {
    id: 'conv-1',
    participantIds: ['user-1', 'user-2'],
    swapId: 'swap-1',
    createdAt: '2025-12-10T18:00:00Z',
    lastMessageAt: '2026-01-20T17:00:00Z',
    lastMessagePreview: 'Thanks for everything, Alex! Really enjoyed our swap.',
  },
  {
    id: 'conv-2',
    participantIds: ['user-4', 'user-1'],
    swapId: 'swap-2',
    createdAt: '2026-01-05T10:00:00Z',
    lastMessageAt: '2026-01-28T09:15:00Z',
    lastMessagePreview: 'See you Wednesday at 6pm then!',
  },
  {
    id: 'conv-3',
    participantIds: ['user-8', 'user-1'],
    swapId: 'swap-3',
    createdAt: '2026-01-25T14:30:00Z',
    lastMessageAt: '2026-01-25T14:30:00Z',
    lastMessagePreview:
      'Hello Alex! I run a community allotment in Homerton and I am keen to learn some web development...',
  },
  {
    id: 'conv-4',
    participantIds: ['user-3', 'user-2'],
    swapId: 'swap-4',
    createdAt: '2026-01-08T12:00:00Z',
    lastMessageAt: '2026-01-27T18:30:00Z',
    lastMessagePreview: 'Bring your guitar, I will have the carbonara ingredients ready!',
  },
  {
    id: 'conv-5',
    participantIds: ['user-5', 'user-6'],
    swapId: 'swap-5',
    createdAt: '2026-01-12T16:00:00Z',
    lastMessageAt: '2026-01-13T11:20:00Z',
    lastMessagePreview:
      'No worries at all, good luck with the trip! Maybe another time.',
  },
  {
    id: 'conv-6',
    participantIds: ['user-7', 'user-8'],
    swapId: 'swap-6',
    createdAt: '2025-12-28T11:00:00Z',
    lastMessageAt: '2026-01-22T16:30:00Z',
    lastMessagePreview: 'The tomato seedlings are coming along brilliantly!',
  },
];

export const messages: Message[] = [
  // conv-1: Alex <-> Maria (completed swap - web dev for guitar)
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-1',
    content:
      'Hi Maria! I saw your flamenco guitar listing and I would love to learn. I can offer web development lessons in return - could be handy for building a music portfolio site. Fancy a swap?',
    sentAt: '2025-12-10T18:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-2',
    content:
      'Hi Alex! That sounds like a great trade. I have been meaning to get a proper website set up for ages. When works for you?',
    sentAt: '2025-12-11T09:30:00Z',
    isRead: true,
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'user-1',
    content:
      'Brilliant! How about we alternate Saturdays? I can do mornings for the web dev session, then we switch to guitar in the afternoon?',
    sentAt: '2025-12-11T12:15:00Z',
    isRead: true,
  },
  {
    id: 'msg-4',
    conversationId: 'conv-1',
    senderId: 'user-2',
    content:
      'Perfect. Shall we start this Saturday? There is a nice cafe on Mare Street we could meet at first to plan things out.',
    sentAt: '2025-12-11T14:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-5',
    conversationId: 'conv-1',
    senderId: 'user-1',
    content:
      'Sounds great! I will bring my laptop and some notes on getting started with HTML and CSS. Do I need to get my own guitar or do you have a spare?',
    sentAt: '2025-12-11T14:30:00Z',
    isRead: true,
  },
  {
    id: 'msg-6',
    conversationId: 'conv-1',
    senderId: 'user-2',
    content:
      'I have a spare classical guitar you can borrow until you get your own. See you Saturday at 10am!',
    sentAt: '2025-12-11T15:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-7',
    conversationId: 'conv-1',
    senderId: 'user-1',
    content:
      'Just finished our last session and wanted to say a massive thank you. My chord transitions are so much smoother now. Your website is looking great too!',
    sentAt: '2026-01-20T16:30:00Z',
    isRead: true,
  },
  {
    id: 'msg-8',
    conversationId: 'conv-1',
    senderId: 'user-2',
    content:
      'Thanks for everything, Alex! Really enjoyed our swap. The website is exactly what I needed. Let me know if you ever want to do more sessions.',
    sentAt: '2026-01-20T17:00:00Z',
    isRead: true,
  },

  // conv-2: Priya <-> Alex (accepted swap - yoga for React mentoring)
  {
    id: 'msg-9',
    conversationId: 'conv-2',
    senderId: 'user-4',
    content:
      'Hey Alex, I noticed you offer React mentoring. I am trying to build a website for my yoga studio and would love some guidance. I can offer yoga and meditation sessions in return if you are interested!',
    sentAt: '2026-01-05T10:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-10',
    conversationId: 'conv-2',
    senderId: 'user-1',
    content:
      'Hi Priya! I have actually been wanting to try yoga for a while. React might be a bit much if you are starting from scratch though - shall we start with the basics and work up to it?',
    sentAt: '2026-01-06T08:15:00Z',
    isRead: true,
  },
  {
    id: 'msg-11',
    conversationId: 'conv-2',
    senderId: 'user-4',
    content:
      'That sounds sensible. I did a tiny bit of HTML years ago so I am not completely new. And yes, we can start with gentle Vinyasa for you - it is great for people who sit at desks all day!',
    sentAt: '2026-01-06T10:30:00Z',
    isRead: true,
  },
  {
    id: 'msg-12',
    conversationId: 'conv-2',
    senderId: 'user-1',
    content:
      'Ha, you can tell? My back will thank you. How about Wednesday evenings? We could do an hour of coding then an hour of yoga.',
    sentAt: '2026-01-06T11:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-13',
    conversationId: 'conv-2',
    senderId: 'user-4',
    content:
      'Wednesday works perfectly. I have a quiet room at the community centre in Stoke Newington we could use for the yoga portion. For coding, anywhere with wifi is fine for me.',
    sentAt: '2026-01-06T14:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-14',
    conversationId: 'conv-2',
    senderId: 'user-1',
    content:
      'See you Wednesday at 6pm then!',
    sentAt: '2026-01-28T09:15:00Z',
    isRead: true,
  },

  // conv-3: Sarah <-> Alex (pending swap - gardening for web dev)
  {
    id: 'msg-15',
    conversationId: 'conv-3',
    senderId: 'user-8',
    content:
      'Hello Alex! I run a community allotment in Homerton and I am keen to learn some web development to build a volunteer coordination tool. Could teach you organic gardening in exchange - great stress relief from coding!',
    sentAt: '2026-01-25T14:30:00Z',
    isRead: false,
  },

  // conv-4: James <-> Maria (in_progress swap - cooking for guitar)
  {
    id: 'msg-16',
    conversationId: 'conv-4',
    senderId: 'user-3',
    content:
      'Hi Maria, fellow Hackney local here! I am a chef and can teach you authentic Italian cooking. Would love to learn guitar in return - always wanted to play at the restaurant on quiet evenings.',
    sentAt: '2026-01-08T12:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-17',
    conversationId: 'conv-4',
    senderId: 'user-2',
    content:
      'Hi James! I have been to your restaurant actually, the pasta is incredible. I would love cooking lessons from you. Guitar in a restaurant sounds so charming - let us make it happen!',
    sentAt: '2026-01-09T10:45:00Z',
    isRead: true,
  },
  {
    id: 'msg-18',
    conversationId: 'conv-4',
    senderId: 'user-3',
    content:
      'That is so kind, thank you! We could use the restaurant kitchen on Monday mornings when we are closed. For guitar, I am free whenever works for you.',
    sentAt: '2026-01-09T13:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-19',
    conversationId: 'conv-4',
    senderId: 'user-2',
    content:
      'Monday mornings are perfect. Guitar on Thursday evenings? We just had our first cooking session and I am still buzzing. That carbonara technique was a revelation.',
    sentAt: '2026-01-15T20:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-20',
    conversationId: 'conv-4',
    senderId: 'user-3',
    content:
      'You are a natural! And I actually managed a full G chord today without buzzing. Slow progress but I love it.',
    sentAt: '2026-01-20T19:30:00Z',
    isRead: true,
  },
  {
    id: 'msg-21',
    conversationId: 'conv-4',
    senderId: 'user-2',
    content:
      'Bring your guitar, I will have the carbonara ingredients ready!',
    sentAt: '2026-01-27T18:30:00Z',
    isRead: true,
  },

  // conv-5: Tom <-> Lena (declined swap - furniture for Spanish)
  {
    id: 'msg-22',
    conversationId: 'conv-5',
    senderId: 'user-5',
    content:
      'Hi Lena, I saw you teach Spanish and I am heading to Barcelona this spring. I am a carpenter and could teach you furniture repair in return. What do you think?',
    sentAt: '2026-01-12T16:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-23',
    conversationId: 'conv-5',
    senderId: 'user-6',
    content:
      'Hi Tom! That is a lovely offer but I am a bit swamped with my current swaps right now. My schedule is really full until March at the earliest. Sorry about that!',
    sentAt: '2026-01-13T11:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-24',
    conversationId: 'conv-5',
    senderId: 'user-5',
    content:
      'No worries at all, good luck with the trip! Maybe another time.',
    sentAt: '2026-01-13T11:20:00Z',
    isRead: true,
  },

  // conv-6: David <-> Sarah (completed swap - photography for gardening)
  {
    id: 'msg-25',
    conversationId: 'conv-6',
    senderId: 'user-7',
    content:
      'Hi Sarah! Just moved to Stoke Newington and my garden is a disaster. I am a professional photographer and can teach you everything about composition and lighting. Would love gardening help in return!',
    sentAt: '2025-12-28T11:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-26',
    conversationId: 'conv-6',
    senderId: 'user-8',
    content:
      'David, that sounds wonderful! I have been wanting to take better photos of the allotment for our community newsletter. When can we start?',
    sentAt: '2025-12-29T08:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-27',
    conversationId: 'conv-6',
    senderId: 'user-7',
    content:
      'How about this weekend? You could come see the state of my garden and we could do a quick photography walk around the neighbourhood to start.',
    sentAt: '2025-12-29T10:30:00Z',
    isRead: true,
  },
  {
    id: 'msg-28',
    conversationId: 'conv-6',
    senderId: 'user-8',
    content:
      'Saturday afternoon works for me. I will bring some seed catalogues so we can plan what to plant based on your garden conditions.',
    sentAt: '2025-12-29T12:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-29',
    conversationId: 'conv-6',
    senderId: 'user-7',
    content:
      'Had such a great time today. Cannot believe the difference just understanding the rule of thirds makes. And you have given me real hope for the garden!',
    sentAt: '2026-01-04T17:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-30',
    conversationId: 'conv-6',
    senderId: 'user-8',
    content:
      'Your photos of the allotment were stunning, everyone in the group loved them. Your raised beds are coming together nicely too - just remember to water the garlic!',
    sentAt: '2026-01-15T09:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-31',
    conversationId: 'conv-6',
    senderId: 'user-7',
    content:
      'The tomato seedlings are coming along brilliantly! Thanks again for all the gardening wisdom. The photography sessions were so rewarding for me too.',
    sentAt: '2026-01-22T16:30:00Z',
    isRead: true,
  },
];
