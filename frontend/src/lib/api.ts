import axios from "axios";

// Base API instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  timeout: 10000,
});

// Types
export interface QueueData {
  currentQueue: number;
  estimatedWaitTime: string;
  nextBatchTime: string;
}

export interface TempleInfo {
  temple: {
    name: string;
    location: string;
    description: string;
    timings: {
      morning: string;
      evening: string;
    };
    contact: {
      phone: string;
      email: string;
      website: string;
    };
    facilities: string[];
  };
  currentStatus: {
    isOpen: boolean;
    specialEvent?: string;
    crowdLevel: "low" | "medium" | "high";
    lastUpdated: string;
  };
  darshanTypes: DarshanType[];
}

export interface DarshanType {
  id: string;
  name: string;
  duration: string;
  price: string;
  description: string;
}

export interface Booking {
  bookingId: number;
  date: string;
  timeSlot: string;
  queueNumber: number;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  darshanType: string;
  devoteeName: string;
  phone: string;
  numberOfDevotees: number;
}

export interface Alert {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: string;
  priority: "low" | "medium" | "high";
}

// Mock data fetchers (will be replaced with real API calls)
export const getQueueData = async (): Promise<QueueData> => {
  // Return inline mock data - replace with actual API call later
  return {
    currentQueue: 45,
    estimatedWaitTime: '25 minutes',
    nextBatchTime: new Date(Date.now() + 15 * 60000).toISOString()
  };
};

export const getTempleInfo = async (): Promise<TempleInfo> => {
  // Return inline mock data - replace with actual API call later
  return {
    temple: {
      name: "Sri Temple",
      location: "Mumbai",
      description: "Historic temple",
      timings: {
        morning: "6:00 AM - 12:00 PM",
        evening: "4:00 PM - 9:00 PM"
      },
      contact: {
        phone: "+91 1234567890",
        email: "info@sritemple.org",
        website: "https://sritemple.org"
      },
      facilities: ["Parking", "Wheelchair Access"]
    },
    currentStatus: {
      isOpen: true,
      crowdLevel: "medium",
      lastUpdated: new Date().toISOString()
    },
    darshanTypes: [
      {
        id: "regular",
        name: "Regular Darshan",
        duration: "30 minutes",
        price: "Free",
        description: "Standard temple visit"
      }
    ]
  };
};

export const getBookings = async (): Promise<Booking[]> => {
  // Return inline mock data - replace with actual API call later
  return [];
};

export const getAlerts = async (): Promise<Alert[]> => {
  // Return inline mock data - replace with actual API call later
  return [
    {
      id: 1,
      title: "Crowd Alert",
      message: "High crowd expected",
      type: "warning",
      timestamp: new Date().toISOString(),
      priority: "medium"
    }
  ];
};

// Future API functions that will replace the mock ones above
export const fetchQueueData = async (): Promise<QueueData> => {
  const response = await api.get("/api/queue");
  return response.data;
};

export const fetchTempleInfo = async (): Promise<TempleInfo> => {
  const response = await api.get("/api/temple/info");
  return response.data;
};

export const fetchBookings = async (): Promise<Booking[]> => {
  const response = await api.get("/api/bookings");
  return response.data;
};

export const fetchAlerts = async (): Promise<Alert[]> => {
  const response = await api.get("/api/alerts");
  return response.data;
};

export const createBooking = async (bookingData: Partial<Booking>): Promise<Booking> => {
  const response = await api.post("/api/bookings", bookingData);
  return response.data;
};

export const updateBooking = async (id: number, bookingData: Partial<Booking>): Promise<Booking> => {
  const response = await api.put(`/api/bookings/${id}`, bookingData);
  return response.data;
};

export const cancelBooking = async (id: number): Promise<void> => {
  await api.delete(`/api/bookings/${id}`);
};

export default api;