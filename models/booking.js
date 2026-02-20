const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  expertId: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  date: {
    type: String,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    default: "Pending",
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema);