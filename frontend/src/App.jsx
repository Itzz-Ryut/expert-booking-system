import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [experts, setExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    timeSlot: "",
    notes: "",
  });
  const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00"
];

  const [searchEmail, setSearchEmail] = useState("");
  const [myBookings, setMyBookings] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [showSlots, setShowSlots] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(2);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);

    fetch(
      `http://localhost:5000/experts?page=${page}&limit=${limit}&category=${category}&search=${search}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setExperts(data.data);
          setTotalPages(data.totalPages);
        }

        setLoading(false);
      });
  }, [page, category, search]);
  useEffect(() => {

  if (!selectedExpert || !form.date) return;

  fetch(`http://localhost:5000/bookings?expertId=${selectedExpert.id}&date=${form.date}`)
    .then(res => res.json())
    .then(data => {

      if (data.success) {
        const slots = data.data.map(b => b.timeSlot);
        setBookedSlots(slots);
      }

    });

}, [selectedExpert, form.date]);

  const handleBooking = async () => {
    if (!validateForm()) return;

    const bookingData = {
      expertId: selectedExpert.id,
      ...form,
    };

    const res = await fetch("http://localhost:5000/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingData),
    });

    const data = await res.json();

    if (data.success) {
      alert("Booking successful ✅");
      setSelectedExpert(null);
      setForm({
        name: "",
        email: "",
        phone: "",
        date: "",
        timeSlot: "",
        notes: "",
      });
    } else {
      alert(data.message);
    }
  };

  const fetchBookings = async () => {
    const res = await fetch(
      `http://localhost:5000/bookings?email=${searchEmail}`,
    );
    const data = await res.json();

    if (data.success) {
      setMyBookings(data.data);
    }
  };
  const validateForm = () => {
    let newErrors = {};

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    } else if (!/^[A-Za-z\s]+$/.test(form.name)) {
      newErrors.name = "Name must contain only letters";
    }

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Enter valid email";
    }

    // Phone validation
    if (!form.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(form.phone)) {
      newErrors.phone =
        "Enter valid phone number, it must contain only numbers";
    }

    // Date validation
    if (!form.date) {
      newErrors.date = "Date is required";
    }

    // Time validation
    if (!form.timeSlot) {
      newErrors.timeSlot = "Time slot required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  return (
    <div className='container'>
      <h1 className='title'>Expert Booking System</h1>

      <h2 style={{ color: "#2c3e50", textAlign: "center" }}>Experts List</h2>
      <input
        className='expert-search-input'
        placeholder='Search expert by name'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className='expert-search-input'
      >
        <option value=''>All Categories</option>
        <option value='Astrologer'>Astrologer</option>
        <option value='Tarot Reader'>Tarot Reader</option>
        <option value='Numerologist'>Numerologist</option>
      </select>
      {loading && <p style={{ textAlign: "center" }}>Loading experts...</p>}
      <div className='experts-grid'>
        {experts.map((expert) => (
          <div key={expert.id} className='card'>
            <h3>{expert.name}</h3>
            <p>Category: {expert.category}</p>
            <p>Experience: {expert.experience} years</p>
            <p>Rating: {expert.rating}</p>

            <button onClick={() => setSelectedExpert(expert)}>
              Book Session
            </button>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={() => {
            if (page > 1) {
              setPage(page - 1);
            }
          }}
          disabled={page <= 1}
        >
          Previous
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() => {
            if (page < totalPages) {
              setPage(page + 1);
            }
          }}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>

      {selectedExpert && (
        <div className='overlay' onClick={() => setSelectedExpert(null)}>
          <div className='form' onClick={(e) => e.stopPropagation()}>
            <span className='close-btn' onClick={() => setSelectedExpert(null)}>
              ×
            </span>

            <h2>Booking for {selectedExpert.name}</h2>

            <input
              type='text'
              placeholder='Name'
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <p className='error'>{errors.name}</p>}

            <input
              type='email'
              placeholder='Email'
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className='error'>{errors.email}</p>}

            <input
              type='tel'
              placeholder='Phone'
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            {errors.phone && <p className='error'>{errors.phone}</p>}

            <input
              type='date'
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            {errors.date && <p className='error'>{errors.date}</p>}

            <div>
              <label>Select Time Slot:</label>

              {/* selector button */}
              <button
                type='button'
                className='slot-selector-btn'
                onClick={() => setShowSlots(!showSlots)}
              >
                {form.timeSlot || "Select Time Slot"}
              </button>

              {/* dropdown slots */}
              {showSlots && (
                <div className='slots-dropdown'>
                  {timeSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);

                    return (
                      <div
                        key={slot}
                        className={`slot-option ${isBooked ? "disabled" : ""}`}
                        onClick={() => {
                          if (!isBooked) {
                            setForm((prev) => ({ ...prev, timeSlot: slot }));
                            setShowSlots(false);
                          }
                        }}
                      >
                        {slot} {isBooked ? "(Booked)" : ""}
                      </div>
                    );
                  })}
                </div>
              )}

              {errors.timeSlot && <p className='error'>{errors.timeSlot}</p>}
            </div>

            <input
              type='text'
              placeholder='Notes'
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <button onClick={handleBooking}>Confirm Booking</button>
          </div>
        </div>
      )}

      <hr />
      <div className='search-section'>
        <h2 style={{ color: "#2c3e50" }}>Check My Bookings</h2>
        <div className='search-box'>
          <input
            className='booking-search-input'
            placeholder='Enter your email'
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />

          <button onClick={fetchBookings}>Search</button>
        </div>
        {myBookings.map((booking) => (
          <div key={booking._id} className='booking-card'>
            <p>
              Expert: {experts.find((e) => e.id === booking.expertId)?.name}
            </p>
            <p>Date: {booking.date}</p>
            <p>Time: {booking.timeSlot}</p>
            <p>Status: {booking.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
