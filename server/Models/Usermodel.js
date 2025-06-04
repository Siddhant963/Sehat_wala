const mongoose = require('mongoose');
const UserSchema = mongoose.Schema( {
     name: {
          type: String,
          required: true
     },
     email: {
          type: String,
          required: true
     },
     password: {
          type: String,
          required: true
     },
     contact:{
          type: String,
          required: true
     }, 
     total_salary: { 
          type: Number,
          required: true
     }, 
     roles: {
          type: [String],
          enum: ['admin', 'staff'],
          default: 'staff'
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
module.exports = mongoose.model('User', UserSchema);