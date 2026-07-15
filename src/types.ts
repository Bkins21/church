export type EventMode = 'physical' | 'virtual' | 'hybrid';

export interface ChurchEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  mode: EventMode;
  banner: string;
  description: string;
  speaker: string;
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

export type PublicationType = 'book' | 'devotional' | 'manual';

export interface Publication {
  id: string;
  title: string;
  type: PublicationType;
  author: string;
  description: string;
  coverUrl: string;
  price: number; // 0 for free download, >0 for physical/ebook
  pages: number;
  publishYear: number;
}

export interface ServiceTimes {
  sunday: string[];
  midweek: string[];
}

export interface Branch {
  id: string;
  name: string;
  region: 'Nigeria' | 'Africa' | 'Europe' | 'North America';
  city: string;
  address: string;
  residentPastor: string;
  pastorPhoto: string;
  contactEmail: string;
  contactPhone: string;
  serviceTimes: ServiceTimes;
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
  userEmail: string;
  userPhone: string;
  userBranch: string;
  ticketCode: string;
  registrationDate: string;
  mode: 'physical' | 'virtual';
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
  category: 'Worship' | 'Preaching' | 'Outreach' | 'Community' | 'Reboot Camp';
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
  uploadedByUser?: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

