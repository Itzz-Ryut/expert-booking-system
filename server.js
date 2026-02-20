const Booking = require("./models/booking");const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://aryan:aryan%405555@cluster0.efidmhp.mongodb.net/expert-booking?retryWrites=true&w=majority")
.then(() => console.log("MongoDB connected ✅"))
.catch(err => console.log(err));

const cors = require("cors");
const express = require("express");

const app = express();

app.use(cors());
app.use(express.json());

/*
Fake experts data (for now)
Later we'll connect MongoDB
*/

const experts = [
  {
    id: 1,
    name: "Rahul Sharma",
    category: "Astrologer",
    experience: 5,
    rating: 4.5,
  },
  {
    id: 2,
    name: "Priya Verma",
    category: "Tarot Reader",
    experience: 3,
    rating: 4.2,
  },
  {
    id: 3,
    name: "Amit Singh",
    category: "Astrologer",
    experience: 8,
    rating: 4.8,
  },
  {
    id: 4,
    name: "Neha Gupta",
    category: "Numerologist",
    experience: 4,
    rating: 4.1,
  },
];

// bookings storage (temporary, later MongoDB)
let bookings = [];
let bookingIdCounter = 1;
// POST booking
app.post("/bookings", async (req, res) => {
  try {
    const { expertId, name, email, phone, date, timeSlot, notes } = req.body;

    if (!expertId || !name || !email || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const existingBooking = await Booking.findOne({
      expertId,
      date,
      timeSlot
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Slot already booked",
      });
    }

    const newBooking = new Booking({
      expertId,
      name,
      email,
      phone,
      date,
      timeSlot,
      notes
    });

    await newBooking.save();

    res.json({
      success: true,
      message: "Booking saved to MongoDB",
      data: newBooking
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
// GET bookings by email
app.get("/bookings", async (req, res) => {
  try {

    const { email, expertId, date } = req.query;

    let query = {};

    // optional filters
    if (email) {
      query.email = email;
    }

    if (expertId) {
      query.expertId = Number(expertId);
    }

    if (date) {
      query.date = date;
    }

    const bookings = await Booking.find(query);

    res.json({
      success: true,
      total: bookings.length,
      data: bookings,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
});
/*
GET /experts API
*/

app.get("/experts", (req, res) => {

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 2;
  const category = req.query.category || "";
  const search = req.query.search || "";

  let filteredExperts = experts;

  // filter by category
  if (category) {
    filteredExperts = filteredExperts.filter(
      e => e.category === category
    );
  }

  // search by name
  if (search) {
    filteredExperts = filteredExperts.filter(
      e => e.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  const total = filteredExperts.length;

  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedExperts = filteredExperts.slice(start, end);

  res.json({
    success: true,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data: paginatedExperts
  });

});

  // GET single expert by ID
app.get("/experts/:id", (req, res) => {
  const expertId = parseInt(req.params.id);

  const expert = experts.find(e => e.id === expertId);

  if (!expert) {
    return res.status(404).json({
      success: false,
      message: "Expert not found",
    });
  }

  res.json({
    success: true,
    data: expert,
  });
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});