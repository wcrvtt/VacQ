const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');

exports.getAppointments = async(req,res,next) => {
    let query;
    let hospitalId = req.params.hospitalId;

    // General user can see only thier appointments
    console.log(req.user.role)
    if(req.user.role !== 'admin'){
        query = Appointment.find({user:req.user.id, hospital:hospitalId}).populate({
            path: 'hospital',
            select: 'name province tel'
        });
    }else{
        query = Appointment.find({hospitalId}).populate({
            path: 'hospital',
            select: 'name province tel'
        });
    }

    try{
        const appointments = await query;

        res.status(200).json({success:true, count:appointments.length, data:appointments});
    }catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false, message: "Cannot find Appointment"});
    }
};

exports.getAppointment = async(req,res,next) => {
    try{
        const appointment = await Appointment.findById(req.params.id).populate({
            path: 'hospital',
            select: 'name description tel'
        });

        if(!appointment){
            return res.status(404).json({success:false, message:`No appointment with the id of ${req.params.id}`});
        }
        res.status(200).json({success:true, data:appointment});
    }catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false, message: "Cannot find Appointment"});
    }
};

exports.addAppointment = async(req,res,next)=>{
    try{
        req.body.hospital = req.params.hospitalId;
        const hospital = await Hospital.findById(req.params.hospitalId);

        if(!hospital){
            return res.status(404).json({success:false, message:`No hospital with the id of ${req.params.hospitalId}`});
        }

        req.body.user = req.user.id;
        const existedAppointments = await Appointment.find({user:req.user.id});

        if(existedAppointments.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success:false, message:`The user with id ${req.user.id} has already made 3 appointments`});
        }

        const appointment = await Appointment.create(req.body);
        res.status(200).json({success:true,data:appointment});
    }catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false, message: "Cannot create Appointment"});
    }
};

exports.updateAppointment = async (req,res,next)=>{
    try{
        let appointment = await Appointment.findById(req.params.id);

        if (!appointment){
            return res.status(404).json({success:false,message:`Cannot find appointment with ${req.params.id}`})

        }
        if(appointment.user.toString()!== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({sucess:false,message:`User ${req.user.id} is not authorized to update this appointment`})
        }
        appointment = await Appointment.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});

        res.status(200).json({success:true,data: appointment});
    }
    catch(err){
        console.log(err.stack);
        return res.status(500).json({success:false,message:"Cannot Update appointment"})
    }
};

exports.deleteAppointment = async(req,res,next)=>{
    try {
        const appointment = await Appointment.findById(req.params.id);

        if(!appointment){
            return res.status(404).json({success:false, message:`No appointment with the id of ${req.params.id}`});
        }

        if(appointment.user.toString()!==req.user.id && req.user.role!=='admin'){
            return res.status(401).json({success:false, message:`User ${req.user.id} is not authorized to delete this appointment`});
        }

        await appointment.remove();
        res.status(200).json({success:true,data:{}});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false, message: "Cannot delete Appointment"});
    }
};