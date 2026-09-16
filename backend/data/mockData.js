// Static Seed Data for Smart Examination Hall Seat Allocation System
// Used by both backend mock endpoints and frontend initial localStorage seeding

const mockRooms = [
  {
    id: "room_101",
    roomName: "Hall 101 - Main Exam Center",
    rows: 5,
    columns: 6,
    capacity: 30,
    benchType: "single",
    description: "Ground floor main academic block"
  },
  {
    id: "room_102",
    roomName: "Hall 102 - Science Wing",
    rows: 4,
    columns: 5,
    capacity: 20,
    benchType: "single",
    description: "First floor north wing"
  },
  {
    id: "room_103",
    roomName: "Hall 103 - Seminar Hall",
    rows: 4,
    columns: 4,
    capacity: 16,
    benchType: "double",
    description: "Second floor quiet seminar hall"
  }
];

const mockStudents = [
  // Computer Science - Section A (CS301)
  { id: "stu_101", rollNumber: "CS2401", name: "Aarav Sharma", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_102", rollNumber: "CS2402", name: "Ananya Iyer", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_103", rollNumber: "CS2403", name: "Devansh Patel", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_104", rollNumber: "CS2404", name: "Diya Mukherjee", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_105", rollNumber: "CS2405", name: "Ishaan Gupta", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_106", rollNumber: "CS2406", name: "Kavya Nair", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_107", rollNumber: "CS2407", name: "Manav Verma", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_108", rollNumber: "CS2408", name: "Meera Reddy", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_109", rollNumber: "CS2409", name: "Nikhil Joshi", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_110", rollNumber: "CS2410", name: "Pooja Malhotra", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_111", rollNumber: "CS2411", name: "Pranav Rao", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },
  { id: "stu_112", rollNumber: "CS2412", name: "Riya Sen", className: "B.Tech CSE", section: "A", subjectCode: "CS301" },

  // Information Technology - Section A (IT302)
  { id: "stu_201", rollNumber: "IT2401", name: "Aditya Roy", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_202", rollNumber: "IT2402", name: "Bhavna Kapoor", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_203", rollNumber: "IT2403", name: "Chetan Das", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_204", rollNumber: "IT2404", name: "Deepika Pillai", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_205", rollNumber: "IT2405", name: "Gautam Mehta", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_206", rollNumber: "IT2406", name: "Harini Sundaram", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_207", rollNumber: "IT2407", name: "Kunal Bansal", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_208", rollNumber: "IT2408", name: "Lavanya Nambiar", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_209", rollNumber: "IT2409", name: "Madhav Singh", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_210", rollNumber: "IT2410", name: "Neha Saxena", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_211", rollNumber: "IT2411", name: "Omkar Kulkarni", className: "B.Tech IT", section: "A", subjectCode: "IT302" },
  { id: "stu_212", rollNumber: "IT2412", name: "Parul Chawla", className: "B.Tech IT", section: "A", subjectCode: "IT302" },

  // Electronics & Communication - Section A (EC303)
  { id: "stu_301", rollNumber: "EC2401", name: "Abhinav Mishra", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_302", rollNumber: "EC2402", name: "Anjali Menon", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_303", rollNumber: "EC2403", name: "Arjun Bhat", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_304", rollNumber: "EC2404", name: "Divya Nagesh", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_305", rollNumber: "EC2405", name: "Farhan Ali", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_306", rollNumber: "EC2406", name: "Isha Deshmukh", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_307", rollNumber: "EC2407", name: "Karthik Srinivas", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_308", rollNumber: "EC2408", name: "Mansi Agrawal", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_309", rollNumber: "EC2409", name: "Naveen Tewari", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_310", rollNumber: "EC2410", name: "Pallavi Ghosh", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_311", rollNumber: "EC2411", name: "Rahul Soni", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },
  { id: "stu_312", rollNumber: "EC2412", name: "Sneha Hegde", className: "B.Tech ECE", section: "A", subjectCode: "EC303" },

  // Mechanical Engineering - Section A (ME304)
  { id: "stu_401", rollNumber: "ME2401", name: "Aakash Choudhury", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_402", rollNumber: "ME2402", name: "Amrita Varma", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_403", rollNumber: "ME2403", name: "Brijesh Pandey", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_404", rollNumber: "ME2404", name: "Dinesh Solanki", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_405", rollNumber: "ME2405", name: "Geetika Kaul", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_406", rollNumber: "ME2406", name: "Himanshu Tiwari", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_407", rollNumber: "ME2407", name: "Jatin Singhal", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_408", rollNumber: "ME2408", name: "Kritika Bajaj", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_409", rollNumber: "ME2409", name: "Mayank Trivedi", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_410", rollNumber: "ME2410", name: "Nikita Biswas", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_411", rollNumber: "ME2411", name: "Rohit Chauhan", className: "B.Tech MECH", section: "A", subjectCode: "ME304" },
  { id: "stu_412", rollNumber: "ME2412", name: "Shweta Nair", className: "B.Tech MECH", section: "A", subjectCode: "ME304" }
];

module.exports = {
  mockRooms,
  mockStudents
};
