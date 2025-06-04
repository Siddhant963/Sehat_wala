const Usermodel = require('../Models/Usermodel');
const Subscriptionmodel = require('../Models/Subscription');
const Coustomermodel = require('../Models/Coustomer')
const Deliverymodel = require('../Models/delivery');
const AttendanceModel = require('../Models/Attendance');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParsar = require('cookie-parser');
require('dotenv').config();

module.exports.RegisterUser = async(req , res )=>{ 
     const {name , email , password , contact , total_salary , roles } = req.body;

     
     if(!name || !email || !password || !contact || !total_salary || !roles){
          return res.status(400).json({message: "All fields are required"});
     }
     let user = await Usermodel.findOne({email});
     if(user){
          return res.status(400).json({message: "User already exists"});
     }else{ 
          const hashedPassword = await bcrypt.hash(password, 10);
          user = new Usermodel({
               name,
               email,
               password: hashedPassword,
               contact,
               total_salary,
               roles
          });
          await user.save();
          return res.status(200).json({message: "User registered successfully"});
     }
}
module.exports.AddCoustomer = async (req, res) => {
    const {
        name,
        email,
        contact,
        address,
        subscription,
        subscription_start_date,
        subscription_end_date,
        meals,
        meals_timeing, // This should be a comma-separated string from frontend
        payment
    } = req.body;

    if (!name || !email || !contact || !address || !subscription || 
        !subscription_start_date || !subscription_end_date || !meals || 
        !meals_timeing || !payment) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        let coustomer = await Coustomermodel.findOne({ email });
        if (coustomer) {
            return res.status(400).json({ message: "Coustomer already exists" });
        }

        // Split the meals_timeing string into an array
        const mealsTimingArray = meals_timeing.split(',').map(time => time.trim());

        coustomer = new Coustomermodel({
            name,
            email,
            contact,
            address,
            subscription,
            subscription_start_date,
            subscription_end_date,
            meals,
            meals_timeing: mealsTimingArray, // Save as array
            payment
        });

        await coustomer.save();
        return res.status(200).json({ message: "Coustomer added successfully" });
    } catch (error) {
        console.error("Error adding customer:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.AddSubscription = async(req,res)=>{ 
     const {name , price , duration , meals } = req.body;
     if(!name || !price || !duration || !meals){
          return res.status(400).json({message: "All fields are required"});
     }
     let subscription = await Usermodel.findOne({name});
     if(subscription){
          return res.status(400).json({message: "Subscription already exists"});
     }else{ 
          subscription = new Subscriptionmodel({
               name,
               price,
               duration,
               meals
          });
          await subscription.save();
          return res.status(200).json({message: "Subscription added successfully", data: subscription});
     }

}

module.exports.AddAttendance = async (req, res) => {
    const { user_id, date, status } = req.body;

    if (!user_id || !date || !status) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        let attendance = await AttendanceModel.findOne({ user_id, date });

        if (attendance) {
            // If attendance exists, check if status is different
            if (attendance.status !== status) {
                attendance.status = status;
                await attendance.save();
                return res.status(200).json({ message: "Attendance status updated" });
            } else {
                return res.status(400).json({ message: "Attendance already marked with same status" });
            }
        } else {
            // If attendance doesn't exist, create new
            attendance = new AttendanceModel({ user_id, date, status });
            await attendance.save();
            return res.status(200).json({ message: "Attendance added successfully" });
        }
    } catch (err) {
        console.error("Error adding attendance:", err);
        return res.status(500).json({ message: "Server error" });
    }
};


module.exports.login = async(req,res) => {
     const {email , password} = req.body;
     if(!email || !password){
          return res.status(400).json({message: "All fields are required"});
     }
     let user = await Usermodel.findOne({email});
     if(!user){
          return res.status(400).json({message: "User not found"});
     }else{ 
          const isMatch = await bcrypt.compare(password, user.password);
          if(!isMatch){
               return res.status(400).json({message: "Invalid credentials"});
          }else{ 
               const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
               const role = user.roles;
            
               res.cookie('token', token, {httpOnly: true});
               return res.status(200).json({message: "Login successful", email , role });
          }
     }
}

module.exports.logout = (req,res) => {
     res.clearCookie('token');
     return res.status(200).json({message: "Logged out successfully"});
}

module.exports.getallcoustomers = async(req,res) => {
     try {
          const coustomers = await Coustomermodel.find();
          return res.status(200).json({message: "Coustomers fetched successfully", data: coustomers});
     } catch (error) {
          return res.status(500).json({message: "Internal server error"});
     }
}
module.exports.getallusers = async(req,res) => {
     try {
          const users = await Usermodel.find();
          return res.status(200).json({message: "Users fetched successfully", data: users});
     } catch (error) {
          return res.status(500).json({message: "Internal server error"});
     }
}
module.exports.getallsubscriptions = async(req,res) => {
     try {
          const subscriptions = await Subscriptionmodel.find();
          return res.status(200).json({message: "Subscriptions fetched successfully", data: subscriptions});
     } catch (error) {
          return res.status(500).json({message: "Internal server error"});
     }
} 

module.exports.getallcoustomersbyfillter = async(req,res) => {
     const { _id , name , email , contact , address , subscription , subscription_start_date , subscription_end_date } = req.query;
     const filter = {};
     if(name){
          filter.name = name;
     }
     if(_id){
          filter._id = _id;
     }
     if(email){
          filter.email = email;
     }
     if(contact){
          filter.contact = contact;
     }
     if(address){
          filter.address = address;
     }
     if(subscription){
          filter.subscription = subscription;
     }
     if(subscription_start_date){
          filter.subscription_start_date = subscription_start_date;
     }
     if(subscription_end_date){
          filter.subscription_end_date = subscription_end_date;
     }
     try {
    
          // console.log("Filter criteria:", filter);
          
          const coustomers = await Coustomermodel.find(filter);
          if(coustomers.length === 0){
               return res.status(404).json({message: "No coustomers found"});
          }
          return res.status(200).json({message: "Coustomers fetched successfully", data: coustomers});
     } catch (error) {
          return res.status(500).json({message: "Internal server error"});
     }
}

module.exports.createDeliveriesByMealType = async (req, res) => {
     try {
         const { meal_type, delivery_date } = req.body;
         
         // Validate required fields
         if (!meal_type || !delivery_date) {
             return res.status(400).json({ message: "Meal type and delivery date are required" });
         }
 
         // Normalize meal type
         const normalizedMealType = meal_type.toLowerCase().trim();
     //     console.log(`Received meal type: ${normalizedMealType}`);
         
         // Validate meal_type
         const validMealTypes = ['breakfast', 'lunch', 'dinner'];
         if (!validMealTypes.includes(normalizedMealType)) {
             return res.status(400).json({ 
                 message: "Invalid meal type. Must be breakfast, lunch, or dinner" 
             });
         }
 
     //     console.log(`Searching for customers with meals_timeing containing: ${normalizedMealType}`);
         
         // Find customers - corrected model name to match your actual model
         const customers = await Coustomermodel.find({
             meals_timeing: normalizedMealType
         });
 
     //     console.log(`Found ${customers.length} customers with this meal type`);
         if (customers.length > 0) {
          //    console.log('Sample customer:', {
          //        id: customers[0]._id,
          //        meals_timeing: customers[0].meals_timeing
          //    });
         }
 
         if (!customers || customers.length === 0) {
             return res.status(404).json({ 
                 message: "No customers found with the specified meal type"
             });
         }
 
         // Create deliveries
         const createdDeliveries = [];
         
         for (const customer of customers) {
           
             
             try {
               //   console.log(`Checking for existing delivery for customer ${customer._id} on ${delivery_date} for ${normalizedMealType}`);
                 
                 // Make sure you're using the correct model name for deliveries
                 const existingDelivery = await Deliverymodel.findOne({
                     customer_id: customer._id,
                     delivery_date: new Date(delivery_date),
                     meal_type: normalizedMealType
                 });
 
                 if (existingDelivery) {
                    //  console.log(`Delivery already exists for customer ${customer._id}`);
                     continue;
                 }
 
               //   console.log(`Creating new delivery for customer ${customer._id}`);
                 
                 // Use the correct model name here
                 const newDelivery = new Deliverymodel({
                     customer_id: customer._id,
                     meal_type: normalizedMealType,
                     delivery_date: new Date(delivery_date),
                     status: 'pending'
                 });
                 
                 await newDelivery.save();
                 
                 createdDeliveries.push({
                     _id: newDelivery._id,
                     customer_id: newDelivery.customer_id,
                     meal_type: newDelivery.meal_type,
                     delivery_date: newDelivery.delivery_date
                 });
                 
               //   console.log(`Created delivery ${newDelivery._id} for customer ${customer._id}`);
             } catch (customerError) {
                 console.error(`Error processing customer ${customer._id}:`, customerError);
                 continue;
             }
         } 
 
         if (createdDeliveries.length === 0) {
          //    console.log('No new deliveries were created - all already exist');
             return res.status(200).json({ 
                 message: "Deliveries already exist for all matching customers" 
             });
         }
 
     //     console.log(`Successfully created ${createdDeliveries.length} deliveries`);
         return res.status(201).json({
             message: `Successfully created ${createdDeliveries.length} deliveries`,
             data: createdDeliveries
         });
 
     } catch (error) {
         console.error("Error in createDeliveriesByMealType:", error);
         return res.status(500).json({ 
             message: "Internal server error", 
             error: error.message 
         });
     }
 };
 module.exports.assignDeliveryPerson = async (req, res) => {
     try {
         const { delivery_person_id, delivery_id } = req.body;
         
         // Validate required fields
         if (!delivery_person_id || !delivery_id) {
             return res.status(400).json({ message: "Delivery person ID and delivery ID are required" });
         }
 
         // Update the delivery
         const updatedDelivery = await Deliverymodel.findByIdAndUpdate(
             delivery_id,
             { 
                 delivery_person_id,
                 status: 'assigned' // Update status to assigned
             },
             { new: true }
         );
 
         if (!updatedDelivery) {
             return res.status(404).json({ message: "Delivery not found" });
         }
 
         return res.status(200).json({
             message: "Delivery person assigned successfully",
             data: updatedDelivery
         });
 
     } catch (error) {
         console.error("Error assigning delivery person:", error);
         return res.status(500).json({ 
             message: "Internal server error", 
             error: error.message 
         });
     }
 };

module.exports.getallDeliveries = async(req,res) => {
     try {
          const deliveries = await Deliverymodel.find();
          return res.status(200).json({message: "Deliveries fetched successfully", data: deliveries});
     } catch (error) {
          return res.status(500).json({message: "Internal server error"});
     }
}
module.exports.getallDeliveriesbyfilter = async (req, res) => {
  try {
    const { delivery_person_id, customer_id, status } = req.query;
    
    // Get today's date in YYYY-MM-DD format (UTC)
    const today = new Date();
    const todayStart = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      0, 0, 0, 0
    ));
    const todayEnd = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      23, 59, 59, 999
    ));
    
    const filter = {
      delivery_date: {
        $gte: todayStart,
        $lte: todayEnd
      }
    };
    
    // Add additional filters if provided
    if (delivery_person_id) {
      if (!mongoose.Types.ObjectId.isValid(delivery_person_id)) {
        return res.status(400).json({ message: "Invalid delivery person ID format" });
      }
      filter.delivery_person_id = delivery_person_id;
    }
    
    if (customer_id) {
      if (!mongoose.Types.ObjectId.isValid(customer_id)) {
        return res.status(400).json({ message: "Invalid customer ID format" });
      }
      filter.customer_id = customer_id;
    }
    
    if (status) {
      const validStatuses = ['pending', 'delivered', 'cancelled', 'assigned'];
      if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({ 
          message: "Invalid status. Valid values are: pending, delivered, cancelled, assigned" 
        });
      }
      filter.status = status.toLowerCase();
    }
    

    
    // Fetch today's deliveries with populated references
    const deliveries = await Deliverymodel.find(filter)
      .populate('delivery_person_id', 'name contact')
      .populate('customer_id', 'name address contact')
      .sort({ delivery_date: 1 });
    
    return res.status(200).json({ 
      message: deliveries.length > 0 
        ? "Today's deliveries fetched successfully" 
        : "No deliveries found for today",
      data: deliveries 
    });
    
  } catch (error) {
    console.error("Error fetching today's deliveries:", error);
    return res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};

module.exports.updateDelivery = async (req, res) => {
     const { delivery_id, customer_id, status } = req.body;
 
     if (!delivery_id || !customer_id || !status) {
         return res.status(400).json({ message: "delivery_id, customer_id, and status are required" });
     }
 
     try {
         const delivery = await Deliverymodel.findById(delivery_id);
         if (!delivery) {
             return res.status(404).json({ message: "Delivery not found" });
         }
 
         const previousStatus = delivery.status;
         delivery.status = status;
         await delivery.save();
 
         // If status changed to "delivered" and wasn't already "delivered", decrement meal count
         if (status.toLowerCase() === "delivered" && previousStatus.toLowerCase() !== "delivered") {
             const customer = await Coustomermodel.findById(customer_id);
 
             if (!customer) {
                 return res.status(404).json({ message: "Customer not found" });
             }
             const subscription = await Subscriptionmodel.findById(customer.subscription);
                if (!subscription) {
                    return res.status(404).json({ message: "Subscription not found" });
                    }
                if (subscription.meals > 0) {
                    // console.log("Meals left in subscription:", subscription.meals);
                    
                    subscription.meals -= 1;
                    // console.log("Meals left in subscription after decrement:", subscription.meals);
                    await subscription.save();
                    } else {
                    return res.status(400).json({ message: "No meals left in subscription" });
                    }

         }
 
         return res.status(200).json({ message: "Delivery status updated successfully" });
 
     } catch (error) {
         console.error("Error updating delivery status:", error);
         return res.status(500).json({ message: "Server error" });
     }
 };

module.exports.updateCoustomer = async (req, res) => {
     const {_id, name, email, contact, address, subscription, subscription_start_date, subscription_end_date , meals , meals_timing , payment } = req.body;
     // console.log("meals_timeing:", meals_timing);
     // console.log("meals_timeing type:", typeof meals_timing);
     
     if (!_id) {
         return res.status(400).json({ message: "Coustomer ID is required" });
     }
     
 
     try {
         const coustomer = await Coustomermodel.findById(_id);
         if (!coustomer) {
             return res.status(404).json({ message: "Coustomer not found" });
         }
       
        
         if (name) coustomer.name = name;
         if (email) coustomer.email = email;
         if (contact) coustomer.contact = contact;
         if (address) coustomer.address = address;
         if (subscription) coustomer.subscription = subscription;
         if (subscription_start_date) coustomer.subscription_start_date = subscription_start_date;
         if (subscription_end_date) coustomer.subscription_end_date = subscription_end_date;
           if (meals) coustomer.meals = meals;
           if (meals_timing && Array.isArray(meals_timing) && typeof meals_timing[0] === "string") {
    coustomer.meals_timeing = meals_timing[0].split(',').map(time => time.trim());
}


           if (payment) coustomer.payment = payment;
           
 
         await coustomer.save();
 
         return res.status(200).json({ message: "Coustomer updated successfully" });
 
     } catch (error) {
         console.error("Error updating coustomer:", error);
         return res.status(500).json({ message: "Server error" });
     }
 };

 module.exports.rechargesubscription = async (req, res) => {
     const { coustomer_id, subscription_id } = req.body;
     
          if (!coustomer_id || !subscription_id) {
          return res.status(400).json({ message: "Coustomer ID and Subscription ID are required" });
          }
     
          try {
          const coustomer = await Coustomermodel.findById(coustomer_id);
          if (!coustomer) {
               return res.status(404).json({ message: "Coustomer not found" });
          }
     
          const subscription = await Subscriptionmodel.findById(subscription_id);
          if (!subscription) {
               return res.status(404).json({ message: "Subscription not found" });
          }
     
          coustomer.subscription = subscription.name;
          coustomer.subscription_start_date = new Date();
          coustomer.subscription_end_date = new Date(new Date().setMonth(new Date().getMonth() + subscription.duration));
     
          await coustomer.save();
     
          return res.status(200).json({ message: "Subscription recharged successfully" });
     
          } catch (error) {
          console.error("Error recharging subscription:", error);
          return res.status(500).json({ message: "Server error" });
          }
     }

     module.exports.getallusersbyfillter = async(req,res) => {
          const { _id , name , email , password , contact , total_salary , roles } = req.query;
          if(!_id && !name && !email && !password && !contact && !total_salary && !roles){
               return res.status(400).json({message: "At least one filter is required"});
          }
          const filter = {};

          if(name){
               filter.name = name;
          }
          if(_id){
               filter._id = _id;
          }
          if(email){
               filter.email = email;
          }
          if(password){
               filter.password = password;
          }
          if(contact){
               filter.contact = contact;
          }
          if(total_salary){
               filter.total_salary = total_salary;
          }
          if(roles){
               filter.roles = roles;
          }
          
          try {
               const users = await Usermodel.find(filter);
               if(users.length === 0){
                    return res.status(404).json({message: "No users found"});
               }
               return res.status(200).json({message: "Users fetched successfully", data: users});
          } catch (error) {
               return res.status(500).json({message: "Internal server error"});
          }
     }

   module.exports.deshbordDetails = async(req,res) =>{ 
     try {
          const totalCoustomers = await Coustomermodel.countDocuments();
          
          
        const totaldayDeleveries = await Deliverymodel.countDocuments({
               delivery_date: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
                    $lt: new Date(new Date().setHours(23, 59, 59, 999)) // End of today
               }
          });
          const totalAttendance = await AttendanceModel.countDocuments(
               {
                    date: {
                         $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
                         $lt: new Date(new Date().setHours(23, 59, 59, 999)) // End of today
                    }
               }
          );
          const penddingDeliveries = await Deliverymodel.countDocuments({status: 'pending'});
          
          return res.status(200).json({
               message: "Dashboard details fetched successfully",
               data: {
                    totalCoustomers,
                    totaldayDeleveries,
                    totalAttendance,
                    penddingDeliveries
                   
               }
          });  
     } 
     catch (error) {
          console.error("Error fetching dashboard details:", error);
          return res.status(500).json({message: "Internal server error"});
     }

   }
module.exports.removeCoustomer = async (req, res) => {
     const { coustomer_id } = req.query;

     if (!coustomer_id) {
         return res.status(400).json({ message: "Coustomer ID is required" });
     }

     try {
         const coustomer = await Coustomermodel.findById(coustomer_id);
         if (!coustomer) {
             return res.status(404).json({ message: "Coustomer not found" });
         }

           // Remove the coustomer
           await Coustomermodel.findByIdAndDelete(coustomer_id);
           return res.status(200).json({ message: "Coustomer removed successfully" });


     } catch (error) {
         console.error("Error removing coustomer:", error);
         return res.status(500).json({ message: "Server error" });
     }
}

module.exports.removeUser = async (req, res) => {
     const { user_id } = req.query;

     if (!user_id) {
         return res.status(400).json({ message: "User ID is required" });
     }

     try {
         const user = await Usermodel.findById(user_id);
         if (!user) {
             return res.status(404).json({ message: "User not found" });
         }

         // Remove the user
         await Usermodel.findByIdAndDelete(user_id);
         return res.status(200).json({ message: "User removed successfully" });

     } catch (error) {
         console.error("Error removing user:", error);
         return res.status(500).json({ message: "Server error" });
     }
}

module.exports.updateUser = async (req, res) => {
     const {_id , name, email ,contact , total_salary, roles} = req.body;
     if (!_id) {
         return res.status(400).json({ message: "User ID is required" });
     }
     try {
         const user = await Usermodel.findById(_id);
         if (!user) {
             return res.status(404).json({ message: "User not found" });
         }

         if (name) user.name = name;
         if (email) user.email = email;
         if (contact) user.contact = contact;
         if (total_salary) user.total_salary = total_salary;
         if (roles) user.roles = roles;

         await user.save();
         return res.status(200).json({ message: "User updated successfully" });

     } catch (error) {
         console.error("Error updating user:", error);
         return res.status(500).json({ message: "Server error" });
     }
}
     
module.exports.getTodayAttendance = async (req, res) => {
     try {
         const todayStart = new Date();
         todayStart.setHours(0, 0, 0, 0); // Start of today
         
         const todayEnd = new Date();
         todayEnd.setHours(23, 59, 59, 999); // End of today
         
         const attendance = await AttendanceModel.find({
             date: {
                 $gte: todayStart,
                 $lt: todayEnd
             }
         }).populate('user_id', 'name contact'); // Populate user details
         
         return res.status(200).json({ 
             message: "Today's attendance fetched successfully", 
             data: attendance 
         });
     } catch (error) {
         console.error("Error fetching today's attendance:", error);
         return res.status(500).json({ 
             message: "Internal server error", 
             error: error.message 
         });
     }
 }

module.exports.getAllUserAttendanceForToday = async (req, res) => {
    try {
        const users = await Usermodel.find();
        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0); // Start of today

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999); // End of today

        const attendance = await AttendanceModel.find({
            date: {
                $gte: todayStart,
                $lt: todayEnd
            },
            user_id: { $in: users.map(user => user._id) }
        }).populate('user_id', 'name contact');

        return res.status(200).json({
            message: "Today's attendance for all users fetched successfully",
            data: attendance
        });

    } catch (error) {
        console.error("Error fetching today's attendance for all users:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports.getUsersWithoutAttendanceToday = async (req, res) => {
    try {
        // Get the current date in the local timezone
        const now = new Date();
        
        // Set the start of today in local timezone
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        
        // Set the end of today in local timezone
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        
        console.log("Today's date range:", todayStart, "to", todayEnd);

        // Step 1: Get all distinct user_ids who have attendance records today
        const attendedUserIds = await AttendanceModel.find({
            date: {
                $gte: todayStart,
                $lte: todayEnd
            }
        }).distinct("user_id");
        console.log("Attended User IDs:", attendedUserIds);
        
        // Step 2: Find all staff users who are not in the attendedUserIds array
        const usersWithoutAttendance = await Usermodel.find({
            roles: "staff",
            _id: { $nin: attendedUserIds }
        }).select('-password');

        return res.status(200).json({
            success: true,
            message: "Staff users who have not marked attendance today",
            count: usersWithoutAttendance.length,
            data: usersWithoutAttendance
        });

    } catch (error) {
        console.error("Error fetching users without attendance:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

