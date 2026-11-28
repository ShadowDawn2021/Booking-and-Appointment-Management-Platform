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

export type Role = "PROVIDER" | "CUSTOMER";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface BookingView {
  id: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  service: { id: string; name: string; durationMinutes: number; price: string };
  provider: {
    id: string;
    businessName: string;
    slug: string;
    timezone: string;
  };
  customer: { id: string; name: string; email: string };
}

export interface ProviderProfile extends PublicProvider {
  userId: string;
}
