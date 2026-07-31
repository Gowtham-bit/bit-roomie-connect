// Deterministic mock dataset for the BIT Hostel portal.
// Seeded PRNG keeps SSR and client renders identical.

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260731);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)] as T;
const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));

const FIRST_M = [
  "Aravind","Karthik","Surya","Vignesh","Hariharan","Dinesh","Mohan","Bala",
  "Praveen","Sanjay","Rohit","Naveen","Manoj","Ashwin","Gokul","Rahul",
  "Sathish","Vimal","Yuvaraj","Aditya","Nithin","Prem","Kavin","Jeevan",
];
const FIRST_F = [
  "Anitha","Divya","Keerthana","Meenakshi","Nandhini","Priya","Sowmya","Swetha",
  "Vaishnavi","Yamini","Harini","Janani","Lakshmi","Deepika","Aishwarya","Ramya",
  "Kavya","Sneha","Pooja","Tharani","Monika","Abinaya","Charumathi","Ishwarya",
];
const LAST = [
  "Kumar","Raj","Subramanian","Venkatesh","Ramesh","Natarajan","Sundaram","Krishnan",
  "Murugan","Palanisamy","Chandrasekar","Balaji","Ganesan","Iyer","Sekar","Arumugam",
  "Perumal","Devaraj","Anand","Selvam",
];

export const DEPARTMENTS = [
  "Computer Science and Engineering",
  "Information Technology",
  "Artificial Intelligence and Data Science",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Biomedical Engineering",
  "Mechatronics Engineering",
  "Food Technology",
] as const;

export const DEPT_SHORT: Record<string, string> = {
  "Computer Science and Engineering": "CSE",
  "Information Technology": "IT",
  "Artificial Intelligence and Data Science": "AIDS",
  "Electronics and Communication Engineering": "ECE",
  "Electrical and Electronics Engineering": "EEE",
  "Mechanical Engineering": "MECH",
  "Civil Engineering": "CIVIL",
  "Biomedical Engineering": "BME",
  "Mechatronics Engineering": "MCT",
  "Food Technology": "FT",
};

export const HOMETOWNS = [
  "Erode","Coimbatore","Salem","Madurai","Trichy","Chennai","Tirupur","Namakkal",
  "Karur","Dindigul","Thanjavur","Vellore","Sivakasi","Nagercoil","Hosur","Ooty",
];

export const LANGUAGES = ["Tamil", "English", "Telugu", "Malayalam", "Kannada", "Hindi"];

export const INTERESTS = [
  "Cricket","Football","Coding","Gaming","Music","Photography","Reading","Chess",
  "Gym","Cycling","Drawing","Robotics","Trekking","Movies","Badminton","Cooking",
];

export type Gender = "Male" | "Female";

export type Student = {
  id: string;
  name: string;
  regNo: string;
  department: string;
  dept: string;
  year: 1 | 2 | 3 | 4;
  gender: Gender;
  email: string;
  mobile: string;
  hometown: string;
  language: string;
  interests: string[];
  hostel: string | null;
  room: string | null;
  cgpa: string;
  avatar: string;
  compatibility: number;
  traits: {
    sleep: string;
    cleanliness: number;
    food: "Veg" | "Non-Veg";
    personality: "Introvert" | "Extrovert" | "Ambivert";
    noise: string;
  };
};

export type Hostel = {
  id: string;
  name: string;
  type: "Boys" | "Girls";
  floors: number;
  totalRooms: number;
  capacity: number;
  occupied: number;
  warden: string;
  facilities: string[];
  image: string;
};

export type Room = {
  id: string;
  hostelId: string;
  hostelName: string;
  number: string;
  floor: number;
  capacity: number;
  occupied: number;
  type: "AC" | "Non-AC";
  rent: number;
  facilities: string[];
};

export type Complaint = {
  id: string;
  student: string;
  regNo: string;
  category: string;
  title: string;
  hostel: string;
  room: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Resolved";
  createdAt: string;
  assignedTo: string;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  category: "Academic" | "Hostel" | "Mess" | "Payment" | "Event";
  date: string;
  read: boolean;
};

export type Payment = {
  id: string;
  student: string;
  regNo: string;
  term: string;
  amount: number;
  paid: number;
  status: "Paid" | "Pending" | "Partial";
  date: string;
  mode: string;
};

export type AttendanceRecord = {
  id: string;
  date: string;
  status: "Present" | "Absent" | "Leave";
  regNo: string;
};

const HOSTEL_NAMES: Array<[string, "Boys" | "Girls"]> = [
  ["Kaveri Block", "Boys"],
  ["Bhavani Block", "Boys"],
  ["Amaravathi Block", "Boys"],
  ["Vaigai Block", "Boys"],
  ["Thamirabarani Block", "Boys"],
  ["Nila Block", "Girls"],
  ["Malligai Block", "Girls"],
  ["Sengamalam Block", "Girls"],
  ["Ponni Block", "Girls"],
  ["Sitrarasi Block", "Girls"],
];

const FACILITIES = [
  "Wi-Fi","Study Table","Attached Bathroom","Hot Water","Laundry","Gym",
  "Reading Room","RO Water","CCTV","Power Backup","Mess","Sports Court",
];

export const hostels: Hostel[] = HOSTEL_NAMES.map(([name, type], i) => {
  const floors = int(3, 6);
  const totalRooms = int(20, 32);
  const capacity = totalRooms * 4;
  return {
    id: `H${String(i + 1).padStart(2, "0")}`,
    name,
    type,
    floors,
    totalRooms,
    capacity,
    occupied: Math.floor(capacity * (0.55 + rand() * 0.4)),
    warden: `${pick(type === "Boys" ? FIRST_M : FIRST_F)} ${pick(LAST)}`,
    facilities: FACILITIES.slice(0, 6).concat(pick(FACILITIES) as string),
    image: `https://images.unsplash.com/photo-${
      (["1555854877-bab0e564b8d5", "1522708323590-d24dbb6b0267", "1560448204-e02f11c3d0e2", "1586023492125-27b2c045efd7"][i % 4] as string)
    }?auto=format&fit=crop&w=900&q=70`,
  };
});

export const rooms: Room[] = (() => {
  const list: Room[] = [];
  let n = 0;
  while (list.length < 250) {
    const h = hostels[n % hostels.length]!;
    const floor = int(0, h.floors - 1);
    const capacity = pick([2, 3, 4, 4] as const);
    list.push({
      id: `R${String(list.length + 1).padStart(3, "0")}`,
      hostelId: h.id,
      hostelName: h.name,
      number: `${floor === 0 ? "G" : floor}${String(int(1, 40)).padStart(2, "0")}`,
      floor,
      capacity,
      occupied: int(0, capacity),
      type: rand() > 0.6 ? "AC" : "Non-AC",
      rent: capacity === 2 ? 78000 : capacity === 3 ? 64000 : 52000,
      facilities: [...FACILITIES].sort(() => rand() - 0.5).slice(0, 5),
    });
    n++;
  }
  return list;
})();

export const students: Student[] = Array.from({ length: 500 }, (_, i) => {
  const gender: Gender = rand() > 0.45 ? "Male" : "Female";
  const name = `${pick(gender === "Male" ? FIRST_M : FIRST_F)} ${pick(LAST)}`;
  const department: string = pick(DEPARTMENTS);
  const year = pick([1, 2, 3, 4] as const);
  const batch = 2026 - year;
  const regNo = `${batch}${String(int(100, 999))}${String(i).padStart(3, "0")}`;
  const hostel: Hostel = pick(hostels.filter((h) => h.type === (gender === "Male" ? "Boys" : "Girls")));
  const allocated = rand() > 0.18;
  return {
    id: `S${String(i + 1).padStart(3, "0")}`,
    name,
    regNo,
    department,
    dept: DEPT_SHORT[department]!,
    year,
    gender,
    email: `${name.split(" ")[0]!.toLowerCase()}.${DEPT_SHORT[department]!.toLowerCase()}${year}@bitsathy.ac.in`,
    mobile: `9${int(100000000, 899999999)}`,
    hometown: pick(HOMETOWNS),
    language: pick(LANGUAGES),
    interests: [...INTERESTS].sort(() => rand() - 0.5).slice(0, 4),
    hostel: allocated ? hostel.name : null,
    room: allocated ? `${int(1, 5)}${String(int(1, 40)).padStart(2, "0")}` : null,
    cgpa: (6.5 + rand() * 3.4).toFixed(2),
    avatar: `https://i.pravatar.cc/160?img=${(i % 70) + 1}`,
    compatibility: int(58, 98),
    traits: {
      sleep: pick(["Before 10 PM", "10 PM – 12 AM", "After Midnight"]),
      cleanliness: int(2, 5),
      food: rand() > 0.45 ? "Veg" : "Non-Veg",
      personality: pick(["Introvert", "Extrovert", "Ambivert"] as const),
      noise: pick(["Silent", "Moderate", "Lively"]),
    },
  };
});

const COMPLAINT_TITLES: Record<string, string[]> = {
  Electricity: ["Tube light not working", "Fan making noise", "Power socket sparking"],
  Water: ["No hot water in morning", "Tap leakage", "Low water pressure"],
  Internet: ["Wi-Fi very slow", "No signal on 3rd floor", "Frequent disconnection"],
  Furniture: ["Broken study chair", "Cot bolt loose", "Cupboard door damaged"],
  Cleaning: ["Corridor not cleaned", "Washroom cleaning required", "Dustbin overflowing"],
  Others: ["Mess food quality", "Lost ID card", "Noise after lights off"],
};
const CATEGORIES = Object.keys(COMPLAINT_TITLES);

const dateStr = (daysAgo: number) =>
  new Date(2026, 6, 31 - daysAgo).toISOString().slice(0, 10);

export const complaints: Complaint[] = Array.from({ length: 100 }, (_, i) => {
  const s = students[int(0, 499)]!;
  const category = pick(CATEGORIES);
  return {
    id: `C${String(i + 1).padStart(3, "0")}`,
    student: s.name,
    regNo: s.regNo,
    category,
    title: pick(COMPLAINT_TITLES[category]!),
    hostel: s.hostel ?? hostels[0]!.name,
    room: s.room ?? "212",
    priority: pick(["Low", "Medium", "High"] as const),
    status: pick(["Pending", "In Progress", "Resolved", "Resolved"] as const),
    createdAt: dateStr(int(0, 60)),
    assignedTo: pick(["Maintenance Team", "Housekeeping", "IT Support", "Electrician"]),
  };
});

export const notifications: Notification[] = Array.from({ length: 100 }, (_, i) => {
  const category = pick(["Academic", "Hostel", "Mess", "Payment", "Event"] as const);
  const bodies: Record<string, string[]> = {
    Academic: ["Semester exam timetable published on the student portal.", "Internal assessment marks are now available."],
    Hostel: ["Room inspection scheduled this weekend across all blocks.", "Water supply maintenance from 10 AM to 1 PM."],
    Mess: ["Special dinner menu announced for the weekend.", "Mess bill for the month has been finalised."],
    Payment: ["Hostel fee second instalment due next week.", "Payment receipt generated for your last transaction."],
    Event: ["Inter-hostel cricket tournament registrations are open.", "Cultural night at the open-air auditorium."],
  };
  return {
    id: `N${String(i + 1).padStart(3, "0")}`,
    title: `${category} update #${i + 1}`,
    body: pick(bodies[category]!),
    category,
    date: dateStr(int(0, 90)),
    read: rand() > 0.45,
  };
});

export const attendance: AttendanceRecord[] = Array.from({ length: 200 }, (_, i) => {
  const r = rand();
  return {
    id: `A${String(i + 1).padStart(3, "0")}`,
    date: dateStr(i % 120),
    status: r > 0.16 ? "Present" : r > 0.07 ? "Absent" : "Leave",
    regNo: students[i % 500]!.regNo,
  };
});

export const payments: Payment[] = Array.from({ length: 200 }, (_, i) => {
  const s = students[i % 500]!;
  const amount = pick([52000, 64000, 78000]);
  const state = pick(["Paid", "Paid", "Pending", "Partial"] as const);
  return {
    id: `P${String(i + 1).padStart(3, "0")}`,
    student: s.name,
    regNo: s.regNo,
    term: pick(["2026 Term I", "2026 Term II", "2025 Term II"]),
    amount,
    paid: state === "Paid" ? amount : state === "Partial" ? Math.round(amount / 2) : 0,
    status: state,
    date: dateStr(int(0, 180)),
    mode: pick(["UPI", "Net Banking", "Card", "DD"]),
  };
});

export type Match = Student & { matchId: string; status: "Suggested" | "Requested" | "Accepted" | "Rejected" };

export const matches: Match[] = students
  .slice(0, 100)
  .map((s, i) => ({
    ...s,
    matchId: `M${String(i + 1).padStart(3, "0")}`,
    compatibility: 60 + ((i * 7) % 39),
    status: pick(["Suggested", "Suggested", "Requested", "Accepted", "Rejected"] as const),
  }))
  .sort((a, b) => b.compatibility - a.compatibility);

export const currentStudent: Student = {
  ...students[0]!,
  name: "Aravind Subramanian",
  regNo: "7376242AD142",
  department: "Artificial Intelligence and Data Science",
  dept: "AIDS",
  year: 3,
  gender: "Male",
  email: "aravind.aids@bitsathy.ac.in",
  mobile: "9843217650",
  hostel: "Kaveri Block",
  room: "312",
  avatar: "https://i.pravatar.cc/160?img=12",
};

export const stats = {
  students: 500,
  rooms: 250,
  hostels: hostels.length,
  boys: hostels.filter((h) => h.type === "Boys").length,
  girls: hostels.filter((h) => h.type === "Girls").length,
  capacity: hostels.reduce((a, h) => a + h.capacity, 0),
  occupied: hostels.reduce((a, h) => a + h.occupied, 0),
  complaints: complaints.length,
  pendingComplaints: complaints.filter((c) => c.status !== "Resolved").length,
};

export const occupancyByHostel = hostels.map((h) => ({
  name: h.name.replace(" Block", ""),
  occupied: h.occupied,
  vacant: h.capacity - h.occupied,
}));

export const applicationTrend = [
  { month: "Feb", applications: 42, approved: 30 },
  { month: "Mar", applications: 68, approved: 51 },
  { month: "Apr", applications: 95, approved: 74 },
  { month: "May", applications: 130, approved: 108 },
  { month: "Jun", applications: 176, approved: 152 },
  { month: "Jul", applications: 210, approved: 188 },
];

export const complaintsByCategory = CATEGORIES.map((c) => ({
  category: c,
  count: complaints.filter((x) => x.category === c).length,
}));
