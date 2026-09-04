import { ChurchEvent, Teaching, Publication, Branch, GalleryItem, Song, HeroImage } from './types';
import edificeConferenceFlyer from './assets/images/edifice-conference-2026.jpg';

export const crossworshipSongsCatalog: Song[] = [];

export const EDIFICE_CONFERENCE_2026_IMAGE = edificeConferenceFlyer;

export const upcomingMeetings: ChurchEvent[] = [
  {
    id: 'edifice-conference-2026',
    title: 'Edifice Conference',
    date: 'October 30th to November 1st, 2026',
    time: 'Friday - 5pm, Saturday - 7am, Sunday - 6am',
    location: 'Peter Akinola Foundation, Abeokuta',
    
    banner: EDIFICE_CONFERENCE_2026_IMAGE,
    description: 'Our annual centerpiece conference building a solid, unshakeable foundation in Christian theology, ministry leadership, and doctrinal clarity.',
  
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
    registeredCount: 0
  },
  {
    id: 'oasis-camp-meeting-2027',
    title: 'Oasis Camp Meeting',
    date: 'Coming soon in 2027',
    time: 'To be announced',
    location: 'To be announced',
    
    banner: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
        registeredCount: 0
  },
  {
    id: 'reaching-world-campmeeting-2027',
    title: 'Reaching our World CampMeeting',
    date: 'Coming soon in 2027',
    time: 'To be announced',
    location: 'To be announced',
    
    banner: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=1200&auto=format&fit=crop',
    description: 'A powerful global gathering focused on missions expansion, global evangelism, and reaching our world with the saving message of Jesus Christ.',
    
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
    address: "God's Edifice Hall, Macjob Secondary school, Onikolobo, Oluwo junction, Abeokuta, Ogun state",
    residentPastor: 'Boluwatife Akintola',
    pastorPhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
    contactEmail: 'onikolobo@godsedifice.org',
    contactPhone: '+234 817 480 3005',
    
    liveStreamUrl: 'https://mixlr.com/gec-onikolobo',
    mapEmbedSearch: 'Onikolobo Road, Abeokuta, Ogun State'
  },
  {
    id: 'gec-yaba',
    name: 'GEC Lagos Mainland (Yaba)',
    region: 'Nigeria',
    city: 'Lagos',
    address: 'NSPRI building, 32-38 Barikisu Iyede Street, off University of Lagos (UNILAG) Road, Abule Oja / Onitiri, Yaba, Lagos',
    residentPastor: 'Kolawole Asaolu',
    pastorPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
    contactEmail: 'yabachurch@godsedifice.org',
    contactPhone: '+234 812 789 4081',
    liveStreamUrl: 'https://mixlr.com/gec-yaba',
    mapEmbedSearch: 'Herbert Macaulay Way, Sabo, Yaba, Lagos'
  },

   {
    id: 'gec-itori',
    name: 'GEC Itori',
    region: 'Nigeria',
    city: 'Ewekoro',
    address: 'Testimony Group of Schools, behind Ejalonibu, Onigbedu street, Itori Ewekoro, Ogun state.',
    residentPastor: 'Oreoluwa Adebayo',
    pastorPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
    contactEmail: 'itorichurch@godsedifice.org',
    contactPhone: '+234 816 655 2066',
    liveStreamUrl: 'https://mixlr.com/gec-yaba',
    mapEmbedSearch: 'Onigbedu street, Itori Ewekoro, Ogun state'
  },

   {
    id: 'gec-magboro',
    name: 'GEC Magboro',
    region: 'Nigeria',
    city: 'Magboro',
    address: 'Plot 3, Rd 3 Extension Oladejo Estate, Akintande, Magboro, Ogun State',
    residentPastor: 'Oluwatobiloba Olabode',
    pastorPhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
    contactEmail: 'magborochurch@godsedifice.org',
    contactPhone: '+234 803 870 8417',
   
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

export const DEFAULT_HOME_HERO_IMAGES: HeroImage[] = [
  {
    id: 'hero-home-1',
    section: 'home',
    imageUrl: 'https://hnunflpzqxkwkzjhnbpz.supabase.co/storage/v1/object/public/hero-images/0U0A0972.JPG',
    title: "God's Edifice Church Worship",
    altText: "God's Edifice Church Worship Atmosphere",
    displayOrder: 1,
  },
  {
    id: 'hero-home-2',
    section: 'home',
    imageUrl: 'https://hnunflpzqxkwkzjhnbpz.supabase.co/storage/v1/object/public/hero-images/0U0A1011.JPG',
    title: "Crossworship Choir",
    altText: "Crossworship Choir Ministration",
    displayOrder: 2,
  },
  {
    id: 'hero-home-3',
    section: 'home',
    imageUrl: 'https://hnunflpzqxkwkzjhnbpz.supabase.co/storage/v1/object/public/hero-images/0U0A1287.JPG',
    title: "God's Edifice Ministry",
    altText: "God's Edifice Church Ministry Atmosphere",
    displayOrder: 3,
  },
  {
    id: 'hero-home-4',
    section: 'home',
    imageUrl: 'https://hnunflpzqxkwkzjhnbpz.supabase.co/storage/v1/object/public/hero-images/0U0A1537.JPG',
    title: "The Word Exaltation",
    altText: "Word Exaltation and Preaching",
    displayOrder: 4,
  },
  {
    id: 'hero-home-5',
    section: 'home',
    imageUrl: 'https://hnunflpzqxkwkzjhnbpz.supabase.co/storage/v1/object/public/hero-images/0U0A1540.JPG',
    title: "Congregation Praising God",
    altText: "Congregation Praising God in Joy",
    displayOrder: 5,
  },
  {
    id: 'hero-home-6',
    section: 'home',
    imageUrl: 'https://hnunflpzqxkwkzjhnbpz.supabase.co/storage/v1/object/public/hero-images/0U0A1571.JPG',
    title: "Sanctuary Devotion",
    altText: "Sanctuary Prayer and Devotion",
    displayOrder: 6,
  },
];

export const DEFAULT_WHO_WE_ARE_HERO_IMAGES: HeroImage[] = [
  {
    id: 'hero-who-we-are-1',
    section: 'who_we_are',
    imageUrl: 'https://hnunflpzqxkwkzjhnbpz.supabase.co/storage/v1/object/public/hero-images/group%201.jpg',
    title: "God's Edifice Church Family",
    altText: "God's Edifice Church Family Gathering",
    displayOrder: 1,
  },
];
