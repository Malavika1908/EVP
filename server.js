const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Stripe = require('stripe');

const app = express();
const stripe = new Stripe('your_stripe_secret_key'); // Replace with your Stripe secret key

app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/parking_system', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const User = mongoose.model('User', userSchema);

// Parking Spot Schema
const parkingSpotSchema = new mongoose.Schema({
    location: String,
    isAvailable: { type: Boolean, default: true },
    address: String
});

const ParkingSpot = mongoose.model('ParkingSpot', parkingSpotSchema);

// Authentication Middleware
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    if (!token) return res.status(401).send('Access Denied');

    try {
        const verified = jwt.verify(token, 'secret_key');
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).send('Invalid Token');
    }
};

// Routes
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const user = new User({ username, password });
    await user.save();

    res.send('User registered');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).send('Username or password is wrong');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send('Invalid password');

    const token = jwt.sign({ _id: user._id }, 'secret_key');
    res.header('Authorization', `Bearer ${token}`).send('Logged in');
});

app.get('/available-spots', authMiddleware, async (req, res) => {
    const spots = await ParkingSpot.find({ isAvailable: true });
    res.send(spots);
});

app.post('/search-spots', async (req, res) => {
    const { address, startDatetime, endDatetime } = req.body;

    // For simplicity, this example only filters by address
    // You can extend this logic to include date/time filtering
    const spots = await ParkingSpot.find({ address, isAvailable: true });

    res.send(spots);
});

app.post('/book-spot/:id', authMiddleware, async (req, res) => {
    const spot = await ParkingSpot.findById(req.params.id);
    if (!spot || !spot.isAvailable) return res.status(400).send('Spot not available');

    spot.isAvailable = false;
    await spot.save();

    // Simulate payment
    const { paymentMethodId, amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
    });

    res.send('Spot booked and payment successful');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
