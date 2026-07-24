const dns = require("dns");
dns.setServers(["8.8.8.8","8.8.4.4"]);
const express = require("express");
const mongoose = require("mongoose")
const cors = require("cors");
const dotenv = require("dotenv")
const user = require("./models/user")
dotenv.config()

const app = express()
const Port = process.env.PORT || 3000;

app.use(cors())
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
    .then(
    () => {
        console.log("MongoDB Connected Successfully")
    })
    .catch(
        (err) => {
            console.log("Database Server Error" , err.message)
        })


app.post("/register", async (req,res) => {
    try {
        const {name, date,status} = req.body;

        const newUser = await user.create({
        name,
        date,
        status
    });
    res.status(201).json({
        message: "Registration Successfully",
        user : newUser,
    });
    }
    catch(error){
        res.status(500).json({
            message: error.message
        })
    }
})
app.get("/users", async (req,res) => {
    try {
        const users = await user.find();
        res.status(200).json(users);
    }
    catch(error){
        res.status(500).json({
            message: error.message,
        })
    }
})

app.put("/users/:id" , async (req,res) => {
    try{
         const {name, date,status} = req.body;
         const userone = await user.findById(req.params.id);
         if (!userone){
            return res.status(404).json({
                message: "User not Found"
            })
         }

         const updateData = {};
         if(name){
            updateData.name =  name;
         }
         if (date){
            updateData.date = date;
         }
         if(status){
            updateData.status = status;
         }
         if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
               message: "Please provide at least one field to update"
            })
         }

         const updatedUser = await user.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );
        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        })
        

    }
    catch(error){
        res.status(500).json({
            message : error.message
        })
    }
})
app.delete("/users/:id", async(req,res) => {
    try{
    const deletedUser = await user.findByIdAndDelete(req.params.id)
    if (!deletedUser){
        return res.status(404).json({
            message: "user not found",
        })
        }
        res.status(200).json({
            message: "user deleted successfully",
        })
        }
        catch(error) {
            res.status(500).json({
                message: error.message,
            })
        }
})



app.listen(Port, () => {
    console.log(`server running on http://localhost:${Port}`)
})