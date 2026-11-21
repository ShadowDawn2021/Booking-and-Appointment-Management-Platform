export interface PublicProvider {
  id: string;
  businessName: string;
  slug: string;
  timezone: string;
}

export interface Service {
  id: string;
  providerId: string;
  name: string;
  durationMinutes: number;
  price: string; // Prisma serializes Decimal as a string
}

export interface Slot {
  start: string; // UTC ISO
  end: string;
}

export interface SlotsResponse {
  date: string;
  timezone: string;
  durationMinutes: number;
  slots: Slot[];
}
