const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')


// require('../config/db');
require('../db/conn')
const User = require('../model/userSchema')
const Program = require('../model/programSchema');
const Authenticate = require('../middleware/authentiCate');

router.get('/', (req, res) => {
    res.send("hello world the server according to router ")
});
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, cpassword } = req.body; //data des 
        if (!name || !email || !phone || !password || !cpassword) {
            return res.status(422).json({ error: "plz filled the field proprly", isSuccess: false })
        }
        const userExist = await User.findOne({ email: email }) // data find in dbms
        if (userExist) {
            return res.status(422).json({ error: "email already Exist", isSuccess: false });
        }
        if (password != cpassword) {
            return res.status(422).json({ error: "password are not match", isSuccess: false });
        }

        const user = new User({ name, email, phone, password, cpassword })
        await user.save()
        return res.status(201).json({ message: "user registerd succesfuly", isSuccess: true });


    } catch (err) {
        console.log("could not register" + err)
    }

})
//Login route
router.post('/login', async (req, res) => {

    try {
        console.log(req.cookies, "abdul")
        console.log("CALLED")
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "invalid" })
        }
        const userLogin = await User.findOne({ email: email }) //read 
        if (!userLogin) {
            return res.status(400).json({ error: "Invalid Email Id", isSuccess: false })
        }
        const isMatch = await bcrypt.compare(password, userLogin.password)

        if (!isMatch) {
            return res.status(400).json({ error: "Please check your password", isSuccess: false })
        }
        let token;
        token = await userLogin.genrateAUthToken();
        // console.log(token);
        // res.cookie("jwtoken", token, {
        //     // expires: new Date(Date.now() + 25892000000),
        //     // httpOnly: true
        // })
        console.log(token, "TOKEN")
        return res.status(200).json({ message: "Login successfully", data: { userLogin,token}, isSuccess: true })

    } catch (err) {
        console.log(err);

    }

});
router.post('/program',Authenticate,async (req, res) => {
    try{
        const {lan,program,programId,name}= req.body;
        if(!program || !lan){
            return res.json({error:"Incomplete data"});
        }
        
        if(programId) {
            const oldProgram = await Program.findById(programId);
            console.log(oldProgram,"old program is")
            oldProgram.program = program;
            oldProgram.lan = lan;
            const code = await oldProgram.save()
            return res.json({message:"Program updated successfully",programId:code._id,isSuccess:true})
        }
        let code = new Program({ lan,name ,program,user_id:req.userID})
         code = await code.save()
        return res.status(201).json({ message: " succesfuly save",programId:code._id, isSuccess: true }); 

    } catch(error){
        console.log(error)
    }
});

router.get('/list-program',Authenticate,async(req,res)=>{
    try {
        const programs = await Program.find({user_id:req.userID})
        return res.status(201).json({programs})
    } catch (err) {
        console.log(err)
        return res.status(201).json({message:"some error occurred"})
    }
})

router.delete('/delete-program',Authenticate,async (req, res) => {
    try{
        const {programId}= req.body; 
       await Program.findOneAndDelete(programId)
        return res.status(201).json({ message: " succesfuly save", isSuccess: true }); 

    } catch(error){
        console.log(error)
    }
});

router.get('/get-program/:id',async(req,res) => {
    try {
        const {id} = req.params;
        const program = await Program.findById(id)
        return res.status(200).json({program})
    } catch (error) {
        console.log(error)
    }
})


module.exports = router;