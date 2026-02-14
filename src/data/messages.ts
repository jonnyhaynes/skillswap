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
  {
    id: 'conv-7',
    participantIds: ['user-3', 'user-1'],
    swapId: 'swap-7',
    createdAt: '2025-12-12T10:00:00Z',
    lastMessageAt: '2026-01-15T17:00:00Z',
    lastMessagePreview: 'Thanks for the website Alex, it looks brilliant!',
  },
  {
    id: 'conv-8',
    participantIds: ['user-1', 'user-5'],
    swapId: 'swap-8',
    createdAt: '2025-12-18T14:00:00Z',
    lastMessageAt: '2026-01-18T16:00:00Z',
    lastMessagePreview: 'The bookshelf is rock solid now, cheers Tom!',
  },
  {
    id: 'conv-9',
    participantIds: ['user-6', 'user-1'],
    swapId: 'swap-9',
    createdAt: '2025-12-22T09:00:00Z',
    lastMessageAt: '2026-01-20T15:00:00Z',
    lastMessagePreview: 'Danke schön for the React help, Alex!',
  },
  {
    id: 'conv-10',
    participantIds: ['user-1', 'user-7'],
    swapId: 'swap-10',
    createdAt: '2025-12-20T11:00:00Z',
    lastMessageAt: '2026-01-19T14:00:00Z',
    lastMessagePreview: 'Portfolio site is live, really happy with it!',
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

  // conv-7: James <-> Alex (cooking for web dev)
  {
    id: 'msg-32',
    conversationId: 'conv-7',
    senderId: 'user-3',
    content:
      'Hi Alex! I have been meaning to get a basic website set up for the restaurant. Your web dev skills would be perfect. I can teach you Italian cooking in return - we can use the restaurant kitchen!',
    sentAt: '2025-12-12T10:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-33',
    conversationId: 'conv-7',
    senderId: 'user-1',
    content:
      'James, that sounds amazing! I have been to your place and the food is incredible. Would love to learn some of those pasta techniques. Let us do it!',
    sentAt: '2025-12-13T09:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-34',
    conversationId: 'conv-7',
    senderId: 'user-3',
    content:
      'Thanks for the website Alex, it looks brilliant! Already had a few online reservations come through.',
    sentAt: '2026-01-15T17:00:00Z',
    isRead: true,
  },

  // conv-8: Alex <-> Tom (web dev for carpentry)
  {
    id: 'msg-35',
    conversationId: 'conv-8',
    senderId: 'user-1',
    content:
      'Hi Tom! I have a wobbly bookshelf and a desk that needs some love. Happy to help you set up a website for your carpentry business in return. What do you think?',
    sentAt: '2025-12-18T14:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-36',
    conversationId: 'conv-8',
    senderId: 'user-5',
    content:
      'Sounds like a deal, Alex! Bring the bookshelf round to the workshop on Saturday and we will sort it out. A website would be a game changer for getting new customers.',
    sentAt: '2025-12-19T11:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-37',
    conversationId: 'conv-8',
    senderId: 'user-1',
    content:
      'The bookshelf is rock solid now, cheers Tom! Your website is live too - let me know if you want to tweak anything.',
    sentAt: '2026-01-18T16:00:00Z',
    isRead: true,
  },

  // conv-9: Lena <-> Alex (German for React mentoring)
  {
    id: 'msg-38',
    conversationId: 'conv-9',
    senderId: 'user-6',
    content:
      'Hey Alex, I am building a language learning app and could really use some React guidance. I can offer German lessons in return - always useful if you travel to Berlin!',
    sentAt: '2025-12-22T09:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-39',
    conversationId: 'conv-9',
    senderId: 'user-1',
    content:
      'Hi Lena! I have actually been wanting to learn German for a while. A language app sounds like a great project to mentor on too. Let us set something up!',
    sentAt: '2025-12-23T10:30:00Z',
    isRead: true,
  },
  {
    id: 'msg-40',
    conversationId: 'conv-9',
    senderId: 'user-6',
    content:
      'Danke schön for the React help, Alex! The app is really coming together and my understanding of components has clicked.',
    sentAt: '2026-01-20T15:00:00Z',
    isRead: true,
  },

  // conv-10: Alex <-> David (web dev for photography)
  {
    id: 'msg-41',
    conversationId: 'conv-10',
    senderId: 'user-1',
    content:
      'Hi David! I have seen your photography work and it is stunning. I would love to learn the basics of composition and lighting. Can offer web dev help in return - maybe a portfolio site?',
    sentAt: '2025-12-20T11:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-42',
    conversationId: 'conv-10',
    senderId: 'user-7',
    content:
      'Alex, that would be perfect! I have been needing a proper portfolio site for ages. Happy to teach you photography - we could do some walks around Victoria Park for the practical sessions.',
    sentAt: '2025-12-21T08:00:00Z',
    isRead: true,
  },
  {
    id: 'msg-43',
    conversationId: 'conv-10',
    senderId: 'user-7',
    content:
      'Portfolio site is live, really happy with it! Your photos from last weekend were great too - you have got a real eye for it.',
    sentAt: '2026-01-19T14:00:00Z',
    isRead: true,
  },
];
