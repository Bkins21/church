import { ChurchEvent, Teaching, Publication, Branch, GalleryItem, Song } from './types';
import edificeConferenceFlyer from './assets/images/edifice-conference-2026.jpg';

export const crossworshipSongsCatalog: Song[] = [
  {
    id: 'cw-1',
    title: 'Edifice Anthem (God’s Nurturing Place)',
    artist: 'Crossworship',
    album: 'Edifice Anthems Vol. 1',
    duration: '4:35',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=worship-ambient-112191.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    lyrics: `[00:06] [Verse 1]
[00:14] We are the house built upon the rock
[00:22] Rooted in grace, established in His love
[00:31] Unshaken by the storm, standing by faith
[00:40] God's nurturing place, where lives are remade
[00:49]
[00:50] [Chorus]
[00:58] Oh, we are an Edifice of grace
[01:07] A dwelling for Your holy name
[01:16] In prayer and truth we will proclaim
[01:25] Jesus, forever You reign
[01:34]
[01:35] [Verse 2]
[01:43] Filled with the Spirit, walking in power
[01:52] Proclaiming salvation in this very hour
[02:01] Preaching the Gospel to every nation
[02:10] Christ in us, the hope of generation
[02:19]
[02:20] [Chorus]
[02:28] Oh, we are an Edifice of grace
[02:37] A dwelling for Your holy name
[02:46] In prayer and truth we will proclaim
[02:55] Jesus, forever You reign
[03:04]
[03:05] [Bridge]
[03:13] Strong foundations, theological light
[03:22] Walking in love and fervent prayer day and night
[03:31] Built by His Spirit, framed by His Word
[03:40] The greatest story the earth has ever heard
[03:49]
[03:50] [Outro]
[03:58] God's nurturing place
[04:08] Forever established in grace
[04:18] Amen, Amen`,
    downloads: 1420,
    uploadedByUser: false
  },
  {
    id: 'cw-2',
    title: 'The Architecture of Grace',
    artist: 'Crossworship',
    album: 'Foundations of Faith',
    duration: '5:10',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=ambient-piano-worship-124008.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600&auto=format&fit=crop',
    lyrics: `[00:08] [Verse 1]
[00:18] Before the world began, Your grace was planned
[00:29] Held securely in Your mighty hand
[00:40] Not by our works, but by Your righteousness
[00:51] Clothed in the beauty of Your holiness
[01:02]
[01:03] [Chorus]
[01:14] Grace upon grace, overflowing free
[01:25] The cross has won my liberty
[01:36] Established firm, no guilt remains
[01:47] Christ took my debt and broke my chains
[01:58]
[01:59] [Verse 2]
[02:10] Now in the temple of Your Holy Ghost
[02:21] Joined with the angels and the heavenly host
[02:32] We lift our voices in adoration
[02:43] Author and Finisher of our salvation
[02:54]
[02:55] [Chorus]
[03:06] Grace upon grace, overflowing free
[03:17] The cross has won my liberty
[03:28] Established firm, no guilt remains
[03:39] Christ took my debt and broke my chains
[03:50]
[03:51] [Bridge]
[04:02] Hallelujah to the Risen King
[04:13] Every tongue and tribe will sing
[04:24] Glory, honor, power and might
[04:35] Forever walking in Your marvelous light
[04:46]
[04:47] [Outro]
[04:58] In Your grace we stand`,
    downloads: 980,
    uploadedByUser: false
  },
  {
    id: 'cw-3',
    title: 'Holy, Holy, Lord God Almighty',
    artist: 'Crossworship',
    album: 'Sacred Convergences',
    duration: '4:15',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb630cc098.mp3?filename=worship-pad-10118.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=600&auto=format&fit=crop',
    lyrics: `[00:06] [Verse 1]
[00:15] Holy, holy, holy! Lord God Almighty!
[00:26] Early in the morning our song shall rise to Thee
[00:37] Holy, holy, holy! Merciful and mighty!
[00:48] God in three Persons, blessed Trinity!
[00:59]
[01:00] [Chorus]
[01:11] Worthy is the Lamb who was slain
[01:22] To receive glory, honor and praise
[01:33] From the rising of the sun to its setting down
[01:44] Your name is lifted high above every crown
[01:55]
[01:56] [Verse 2]
[02:07] Holy, holy, holy! All the saints adore Thee
[02:18] Casting down their golden crowns around the glassy sea
[02:29] Cherubim and seraphim falling down before Thee
[02:40] Which wert, and art, and evermore shalt be
[02:51]
[02:52] [Bridge]
[03:03] We bow before Your presence Lord
[03:14] Edified and strengthened by Your Word
[03:25] Holy, Holy, Holy are You Lord
[03:36]
[03:37] [Outro]
[03:48] Blessed Trinity, Amen`,
    downloads: 1250,
    uploadedByUser: false
  }
];

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
