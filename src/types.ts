

export interface ChurchEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  mode?: 'physical' | 'virtual' | 'hybrid' | string;
  banner: string;
  description?: string;
  speaker?: string;
  capacity?: number;
  registeredCount: number;
}

export interface Teaching {
  id: string;
  title: string;
  series: string;
  preacher: string;
  date: string;
  duration: string;
  description: string;
  audioUrl: string; // fallback audio stream URL
  coverUrl: string;
  downloadCount: number;
  size: string;
}

export type PublicationType = 'bulletin' | 'book';

export interface Publication {
  id: string;
  title: string;
  type?: PublicationType | string;
  author: string;
  description: string;
  coverUrl: string;
  publishYear: number;
  month?: string; // e.g. "January", "February", etc.
  fileUrl?: string; // PDF download link
  downloadCount?: number;
  createdAt?: string;
}

export interface ServiceTimes {
  sunday?: string[];
  midweek?: string[];
}

export interface Branch {
  id: string;
  name: string;
  region: 'Nigeria';
  city: string;
  address: string;
  residentPastor: string;
  pastorPhoto: string;
  imageUrl?: string;
  contactEmail: string;
  contactPhone: string;
  serviceTimes?: ServiceTimes;
  liveStreamUrl?: string;
  mapEmbedSearch: string; // Query for searching on map
}

export interface Registration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  userName: string;
  firstName?: string;
  surname?: string;
  userEmail: string;
  userPhone: string;
  userBranch: string;
  ticketCode?: string;
  registrationDate: string;
  mode?: 'physical' | 'virtual' | 'hybrid' | string;
  ageRange?: string;
  gender?: string;
  denomination?: string;
  address?: string;
  howHeard?: string;
  expectations?: string;
  isFirstTime?: string;
  isMember?: string;
  otherChurch?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: 'Worship' | 'Preaching' | 'Outreach' | 'Community' | 'Reboot Camp' | string;
  imageUrl: string;
  date: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  audioUrl: string;
  coverUrl: string;
  lyrics?: string;
  downloads?: number;
  uploadedByUser?: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

export type HeroSection = 'home' | 'who_we_are';

export interface HeroImage {
  id: string;
  section: HeroSection;
  imageUrl: string;
  title?: string;
  altText?: string;
  displayOrder?: number;
  createdAt?: string;
}

