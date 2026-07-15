import { ChurchEvent, Teaching, Publication, Branch, GalleryItem } from './types';

export const upcomingMeetings: ChurchEvent[] = [
  {
    id: 'edifice-conference-2026',
    title: 'Edifice Conference',
    date: 'October 1st to 4th, 2026',
    time: '09:00 AM - 08:00 PM Daily',
    location: 'GEC Lekki HQ',
    mode: 'physical',
    banner: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    description: 'Our annual centerpiece conference building a solid, unshakeable foundation in Christian theology, ministry leadership, and doctrinal clarity.',
    speaker: 'Pastor Abiodun Adebayo & Guest Ministers',
    registeredCount: 0
  },
  {
    id: 'end-of-year-retreat-2026',
    title: 'End of the year Retreat',
    date: 'Coming soon in December 2026',
    time: 'To Be Announced',
    location: 'All GEC Branches',
    mode: 'physical',
    banner: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1200&auto=format&fit=crop',
    description: 'Our annual end of year spiritual convergence to reflect on God’s saving grace, build powerful prayer habits, and receive strategic apostolic direction for the coming year.',
    speaker: 'Pastor Abiodun Adebayo',
    registeredCount: 0
  },
  {
    id: 'oasis-camp-meeting-2027',
    title: 'Oasis Camp Meeting',
    date: 'Coming soon in 2027',
    time: 'To Be Announced',
    location: 'GEC Camp Grounds',
    mode: 'physical',
    banner: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
    description: 'A refreshing spiritual camp meeting designed for deep rejuvenation, extended corporate worship, and systematic Bible studies.',
    speaker: 'Pastor Abiodun Adebayo & Guest Ministers',
    registeredCount: 0
  },
  {
    id: 'reaching-world-campmeeting-2027',
    title: 'Reaching our World CampMeeting',
    date: 'Coming soon in 2027',
    time: 'To Be Announced',
    location: 'Main Arena',
    mode: 'physical',
    banner: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=1200&auto=format&fit=crop',
    description: 'A powerful global gathering focused on missions expansion, global evangelism, and reaching our world with the saving message of Jesus Christ.',
    speaker: 'Pastor Abiodun Adebayo & Guest Ministers',
    registeredCount: 0
  }
];

export const teachingsCatalog: Teaching[] = [];

export const publicationsCatalog: Publication[] = [
  {
    id: 'book-preach',
    title: 'Preach: How to Share Your Faith Effectively',
    type: 'book',
    author: 'Pastor Abiodun Adebayo',
    description: 'The masterclass guide on evangelism. In this handbook, Pastor Adebayo provides systematic tools, psychological comfort-builders, and deep scriptural foundations to make sharing Christ second nature to you.',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400&auto=format&fit=crop',
    price: 15,
    pages: 240,
    publishYear: 2024
  },
  {
    id: 'devotional-daily-creed-2026',
    title: 'Daily Creed Devotional 2026 (Volume 2)',
    type: 'devotional',
    author: 'Pastor Abiodun Adebayo',
    description: 'GEC’s daily study resource. Engage in structured devotional reading designed to build rigorous theological habits, intense praying discipline, and daily gratitude. Includes weekly memory verses.',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=400&auto=format&fit=crop',
    price: 0, // Free digital download
    pages: 365,
    publishYear: 2025
  },
  {
    id: 'book-leading-questions',
    title: 'Leading Questions: Honest Answers for Faith',
    type: 'book',
    author: 'Pastor Abiodun Adebayo',
    description: 'Addressing the toughest modern objections to Christian theology. Pastor Adebayo handles tough topics such as science vs. scripture, the existence of evil, church governance, and doctrinal controversies with outstanding grace and analytical precision.',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop',
    price: 12,
    pages: 180,
    publishYear: 2023
  },
  {
    id: 'book-saving-grace',
    title: 'Saving Grace: Understanding Redemptive History',
    type: 'book',
    author: 'Pastor Abiodun Adebayo',
    description: 'An essential text for every systematic theologian. Trace the redemptive narrative from Genesis to Revelation, demonstrating that salvation has always been, and will always be, of grace through faith in the Messiah.',
    coverUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=400&auto=format&fit=crop',
    price: 10,
    pages: 210,
    publishYear: 2022
  }
];

export const ministryBranches: Branch[] = [
  {
    id: 'gec-onikolobo',
    name: 'GEC Abeokuta (Onikolobo)',
    region: 'Nigeria',
    city: 'Abeokuta',
    address: '15 Onikolobo Road, Opposite Lawson Group of Schools, Abeokuta, Ogun State',
    residentPastor: 'Pastor Ore Adebayo',
    pastorPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
    contactEmail: 'onikolobo@godsedifice.org',
    contactPhone: '+234 803 111 2222',
    serviceTimes: {
      sunday: ['09:00 AM'],
      midweek: ['06:00 PM (Wednesday)']
    },
    liveStreamUrl: 'https://mixlr.com/gec-onikolobo',
    mapEmbedSearch: 'Onikolobo Road, Abeokuta, Ogun State'
  },
  {
    id: 'gec-yaba',
    name: 'GEC Lagos Mainland (Yaba)',
    region: 'Nigeria',
    city: 'Lagos',
    address: '34 Herbert Macaulay Way, Sabo, Yaba, Lagos State',
    residentPastor: 'Pastor Kola Asaolu',
    pastorPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
    contactEmail: 'yaba@godsedifice.org',
    contactPhone: '+234 802 333 4444',
    serviceTimes: {
      sunday: ['01:00 PM'],
      midweek: ['06:00 PM (Wednesday)']
    },
    liveStreamUrl: 'https://mixlr.com/gec-yaba',
    mapEmbedSearch: 'Herbert Macaulay Way, Sabo, Yaba, Lagos'
  }
];

export const galleryItems: GalleryItem[] = [
  {
    id: 'g-worship-1',
    title: 'Surrendered Hearts',
    description: 'Dynamic atmosphere of prayers and worship during our monthly Supernatural Outpouring Service.',
    category: 'Worship',
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800&auto=format&fit=crop',
    date: '2026-06-25'
  },
  {
    id: 'g-preach-1',
    title: 'Sound Exposition',
    description: 'Pastor Abiodun Adebayo breaking down theology with crystal-clear logic and scriptural proofs during the Apokalypsis series.',
    category: 'Preaching',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
    date: '2026-06-28'
  },
  {
    id: 'g-reboot-1',
    title: 'Intercessory Fire',
    description: 'Camp attendees locked in powerful corporate intercession during the dawn prayers at Reboot Camp.',
    category: 'Reboot Camp',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=800&auto=format&fit=crop',
    date: '2026-01-08'
  },
  {
    id: 'g-outreach-1',
    title: 'City-wide Witness',
    description: 'GEC Lekki evangelism team taking the gospel message to the local community, demonstrating love and giving booklets.',
    category: 'Outreach',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=800&auto=format&fit=crop',
    date: '2026-05-15'
  },
  {
    id: 'g-community-1',
    title: 'First-timer Reception',
    description: 'Warm smiles and hearty fellowship during our post-service refreshments welcoming new members.',
    category: 'Community',
    imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=800&auto=format&fit=crop',
    date: '2026-06-21'
  },
  {
    id: 'g-worship-2',
    title: 'Atmosphere of Gratitude',
    description: 'A vibrant moment of thanksgiving and joy at the London Broad Street Campus opening service.',
    category: 'Worship',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop',
    date: '2026-06-07'
  }
];
