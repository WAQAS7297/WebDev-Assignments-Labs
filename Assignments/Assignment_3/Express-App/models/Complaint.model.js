const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    userFirstName: {
        type: String,
        required: true
    },
    userLastName: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true,
        minlength: 10
    },
    status: {
        type: String,
        enum: ['pending', 'resolved', 'in_progress'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Complaint', complaintSchema);