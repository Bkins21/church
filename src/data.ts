import { ChurchEvent, Teaching, Publication, Branch, GalleryItem, Song } from './types';

export const crossworshipSongsCatalog: Song[] = [];

export const upcomingMeetings: ChurchEvent[] = [
  {
    id: 'edifice-conference-2026',
    title: 'Edifice Conference',
    date: 'October 28th to November 1st, 2026',
    time: '09:00 AM - 08:00 PM Daily',
    location: 'Peter Akinola Foundation, Abeokuta',
    mode: 'physical',
    banner: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    description: 'Our annual centerpiece conference building a solid, unshakeable foundation in Christian theology, ministry leadership, and doctrinal clarity.',
    speaker: 'Pastor Abiodun Adebayo',
    registeredCount: 0
  },
  {
    id: 'end-of-year-retreat-2026',
    title: 'End of the year Retreat',
    date: 'Coming soon in December 2026',
    time: 'To be announced',
    location: 'To be announced',
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
    time: 'To be announced',
    location: 'To be announced',
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
    time: 'To be announced',
    location: 'To be announced',
    mode: 'physical',
    banner: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=1200&auto=format&fit=crop',
    description: 'A powerful global gathering focused on missions expansion, global evangelism, and reaching our world with the saving message of Jesus Christ.',
    speaker: 'Pastor Abiodun Adebayo & Guest Ministers',
    registeredCount: 0
  }
];

export const teachingsCatalog: Teaching[] = [];

export const publicationsCatalog: Publication[] = [];

export const ministryBranches: Branch[] = [
  {
    id: 'gec-onikolobo',
    name: 'GEC Abeokuta (Onikolobo)',
    region: 'Nigeria',
    city: 'Abeokuta',
    address: '15 Onikolobo Road, Opposite Lawson Group of Schools, Abeokuta, Ogun State',
    residentPastor: 'Pastor Abiodun Adebayo',
    pastorPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
    contactEmail: 'onikolobo@godsedifice.org',
    contactPhone: '+234 803 111 2222',
    serviceTimes: {
      sunday: ['09:00 AM'],
      midweek: ['05:00 PM (Wednesday)']
    },
    liveStreamUrl: 'https://mixlr.com/gec-onikolobo',
    mapEmbedSearch: 'Onikolobo Road, Abeokuta, Ogun State'
  },
  {
    id: 'gec-yaba',
    name: 'GEC Lagos Mainland (Yaba)',
    region: 'Nigeria',
    city: 'Lagos',
    address: 'NSPRI building, 32-38 Barikisu Iyede Street, off University of Lagos (UNILAG) Road, Abule Oja / Onitiri, Yaba, Lagos',
    residentPastor: 'Pastor Kolawole Asaolu',
    pastorPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
    contactEmail: 'yabachurch@godsedifice.org',
    contactPhone: '+234 812 789 4081',
    serviceTimes: {
      sunday: ['01:00 PM'],
      midweek: ['05:00 PM (Wednesday)']
    },
    liveStreamUrl: 'https://mixlr.com/gec-yaba',
    mapEmbedSearch: 'Herbert Macaulay Way, Sabo, Yaba, Lagos'
  }

   {
    id: 'gec-itori',
    name: 'GEC Itori',
    region: 'Nigeria',
    city: 'Ewekoro',
    address: 'Testimony Group of Schools, behind Ejalonibu, Onigbedu street, Itori Ewekoro, Ogun state.',
    residentPastor: 'Pastor Oreoluwa Adebayo',
    pastorPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
    contactEmail: 'itorichurch@godsedifice.org',
    contactPhone: '+234 816 655 2066',
    serviceTimes: {
      sunday: ['09:00 AM'],
      midweek: ['05:00 PM (Wednesday)']
    },
    liveStreamUrl: 'https://mixlr.com/gec-yaba',
    mapEmbedSearch: 'Onigbedu street, Itori Ewekoro, Ogun state'
  }
];

export const galleryItems: GalleryItem[] = [
  
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
