const express = require("express");
const router = express.Router();
const { RegisterUser , AddCoustomer ,   AddAttendance , login ,logout , getallcoustomers ,getallusers  , getallcoustomersbyfillter , createDeliveriesByMealType , getallDeliveries , getallDeliveriesbyfilter , updateDelivery , updateCoustomer , getallusersbyfillter , assignDeliveryPerson ,deshbordDetails, removeCoustomer , removeUser  ,updateUser ,getTodayAttendance , getAllUserAttendanceForToday, getUsersWithoutAttendanceToday , getallStaffusers} = require("../Controllers/AdminController");

router.post('/AddStaff' , RegisterUser);
router.post('/AddCoustomer', AddCoustomer);
router.post('/AddAttendance', AddAttendance);
router.post('/login', login);
router.post('/logout', logout);
router.get('/getallcoustomers', getallcoustomers);
router.get('/getallusers', getallusers);
router.get('/getallcoustomersbyfillter', getallcoustomersbyfillter);
router.post('/createDelivery', createDeliveriesByMealType);
router.get('/getallDeliveries', getallDeliveries);
router.get('/getallDeliveriesbyfilter', getallDeliveriesbyfilter);
router.post('/updateDelivery', updateDelivery);
router.post('/updateCoustomer', updateCoustomer);
router.get('/getallusersbyfillter', getallusersbyfillter);
router.post('/assignDeliveryPerson', assignDeliveryPerson);
router.get('/deshbordDetails', deshbordDetails);
router.get('/removeCoustomer', removeCoustomer);
router.get('/removeUser', removeUser);
router.post('/updateUser', updateUser);
router.get('/getTodayAttendance', getTodayAttendance);
router.get('/getAllUserAttendanceForToday', getAllUserAttendanceForToday);
router.get('/getUsersWithoutAttendanceToday', getUsersWithoutAttendanceToday);
router.get('/getallStaffusers', getallStaffusers);







module.exports = router;
