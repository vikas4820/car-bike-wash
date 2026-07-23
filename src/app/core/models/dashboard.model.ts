export type BookingStatus = 'Pending' | 'Confirmed' | 'In progress' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  customer: string;
  customerId?: string;
  service: string;
  vehicle: string;
  vehicleId?: string;
  date: string;
  time: string;
  address: string;
  amount: number;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  status: BookingStatus;
  technician?: string;
}

export interface Vehicle {
  id: string;
  type: 'Car' | 'Bike';
  make: string;
  model: string;
  registrationNumber: string;
  color: string;
  primary?: boolean;
}

export interface ServicePlan {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  carPrice: number;
  bikePrice: number;
  active: boolean;
  description: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'Active' | 'On leave' | 'Inactive';
  rating: number;
  jobsToday: number;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  date: string;
  method: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Refunded';
}
