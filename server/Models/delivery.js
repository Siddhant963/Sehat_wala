const mongoose = require('mongoose');
const deliverySchema = new mongoose.Schema({
    delivery_person_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    delivery_date: {
        type: Date,
        default: Date.now
    },
    meal_type: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'delivered', 'cancelled'],
        default: 'pending'
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('Delivery', deliverySchema);