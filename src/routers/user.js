const express = require('express');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');

const dateFormat = require("dateformat");



const configData = require('../../config/env');
require('../db/connection')
 
const User = require("../models/User");
const Sender = require("../models/Sender");
const Courier = require("../models/Courier");
const Delivery = require("../models/Delivery");

const userRouters = new express.Router();
const auth = require("../middleware/jwt-middleware")
const { createUserFunction, createJsonResponse} = require("../db/functions/user"); 





 



  userRouters.post("/users/test",auth, async (req, res) => {
        console.log("**********************"); 
        console.log(req.userAuthData); 
        console.log("**********************"); 
  })

/***
 *      _             _       
 *     | | ___   __ _(_)_ __  
 *     | |/ _ \ / _` | | '_ \ 
 *     | | (_) | (_| | | | | |
 *     |_|\___/ \__, |_|_| |_|
 *              |___/         
 */
userRouters.post("/login" , async (req, res) => {
    const reqData = req.body;
    User.findOne({
        where: {
            username: reqData.username
        }
    }).then((user) => {
        if(user){
            if( bcrypt.compareSync(reqData.password, user.password )){
                // user can login
                let userToken = JWT.sign({
                    id: user.id,
                    group: user.group,
                }, configData.jwtArray.secretKey,{
                    expiresIn: configData.jwtArray.expiresIn
                }) 
               
                User.update({ tokenSecret: userToken }, {
                    where: {
                        id: user.id
                    }
                  });
                
                res.status(200).send(
                    createJsonResponse(1, "Login OK", {token: userToken})
                ); 
            }else{
                // data not match
                res.status(500).send(
                    createJsonResponse(0, "Login failed")
                   );
            }

        }else{
             // user don't exist
            res.status(401).send(
                createJsonResponse(0, "User not found")
                );
        }

    }).catch((e)=>{
        res.status(500).send(
            createJsonResponse(0, "An error ocurred", {error: e})
           );
    })
})

/***
 *                _     _       _      _ _                      
 *       __ _  __| | __| |   __| | ___| (_)_   _____ _ __ _   _ 
 *      / _` |/ _` |/ _` |  / _` |/ _ \ | \ \ / / _ \ '__| | | |
 *     | (_| | (_| | (_| | | (_| |  __/ | |\ V /  __/ |  | |_| |
 *      \__,_|\__,_|\__,_|  \__,_|\___|_|_| \_/ \___|_|   \__, |
 *                                                        |___/ 
 */

userRouters.post("/adddelivery",auth, async (req, res) => {
   try {
    const reqData = req.body;
    const authData = req.userAuthData;
    if(req.userAuthData.group !== 2){
        res.status(401).send(
            createJsonResponse(0, "Don't have permission to add deliveries",{token: authData.token})
           ); 
     }else{
        const newDelivery =  await Delivery.create({
            packageSize: reqData.packageSize,
            cost: reqData.cost,
            description: reqData.description,
            date: dateFormat(reqData.date, "isoDate"),
            senderId:  authData.id
        })
        .then((delivery)=>{
            res.status(200).send(
                createJsonResponse(1, "New delivery created successfully",{deliveryId: delivery.id, token: authData.token})
                ); 
        }).catch((e)=>{
            createJsonResponse(0, "An error ocurred", { error: e, token: authData.token})
        })
     }
   } catch (error) {
    res.status(500).send(
        createJsonResponse(0, "An error ocurred", { error: e, token: authData.token})
      ); 
   }
})

/***
 *                    _                   _      _ _                      
 *       __ _ ___ ___(_) __ _ _ __     __| | ___| (_)_   _____ _ __ _   _ 
 *      / _` / __/ __| |/ _` | '_ \   / _` |/ _ \ | \ \ / / _ \ '__| | | |
 *     | (_| \__ \__ \ | (_| | | | | | (_| |  __/ | |\ V /  __/ |  | |_| |
 *      \__,_|___/___/_|\__, |_| |_|  \__,_|\___|_|_| \_/ \___|_|   \__, |
 *                      |___/                                       |___/ 
 */
userRouters.patch("/assigndelivery",auth, async (req, res) => {
    try {
     const reqData = req.body;
     const authData = req.userAuthData;
     if(req.userAuthData.group !== 2){
        res.status(401).send(
            createJsonResponse(0, "Don't have permission to assign deliveries",{token: authData.token})
           ); 
     }else{

        // check if sender is the delivery owner + the delivery wasn't delivered yet
        Delivery.findOne({
            where: {
                senderId: authData.id,
                id: reqData.deliveryId,
                isCompleted: false
            }
        })
        .then((delivery) => {
            if(!delivery){
                res.status(401).send(
                    createJsonResponse(0, "Delivery not found or already delivered",{token: authData.token})
                ); 
            }else{
                   // check if the courier exists + don't have more than 5 deliveries for this day

                  User.findOne({
                       where:{
                           id: reqData.courierId
                       }
                    }).then(response=>{
                        if(!response){
                            res.status(401).send(
                                createJsonResponse(0, "Courier not found",{token: authData.token})
                            ); 
                        }else{
                            Delivery.count({
                                where: {
                                    courierId: reqData.courierId,
                                    date: delivery.date
                                }
                            }).then((count) => {
                                if(count > configData.settingsArray.maxDeliveriesPerDayForCouriers){
                                    res.status(401).send(
                                        createJsonResponse(0, "Can't assign delivery to this Courier because he accedded the maximum per day",{token: authData.token})
                                    ); 
                                }else{
                                    Delivery.update(
                                        {courierId: reqData.courierId},
                                        {
                                        where: {
                                            id: reqData.deliveryId,
                                        }
                                    }).then((result)=>{
                                        res.status(200).send(
                                            createJsonResponse(1, "Delivery assigned to the provided courier",{token: authData.token})
                                        ); 
                                    })
                                      
                                }
                            })
                        }



                    })

               
            


            }
        }).catch((e) =>{
            res.status(500).send(
                createJsonResponse(0, "An error ocurred", { error: e, token: authData.token})
               ); 
        })

     


     }

    }catch{
    res.status(500).send(
        createJsonResponse(0, "An error ocurred", { error: e, token: authData.token})
      ); 
    }
});

/***
 *                 _         _      _ _                _           
 *       __ _  ___| |_    __| | ___| (_)_   _____ _ __(_) ___  ___ 
 *      / _` |/ _ \ __|  / _` |/ _ \ | \ \ / / _ \ '__| |/ _ \/ __|
 *     | (_| |  __/ |_  | (_| |  __/ | |\ V /  __/ |  | |  __/\__ \
 *      \__, |\___|\__|  \__,_|\___|_|_| \_/ \___|_|  |_|\___||___/
 *      |___/                                                      
 */
userRouters.get("/getdeliveries",auth, async (req, res) => {
    const reqData = req.body;
     const authData = req.userAuthData;
    try {
  

     Delivery.findAll({
         where: {
            [(req.userAuthData.group === 2)?'senderId':'courierId']  : authData.id,
            date: dateFormat(reqData.date, "shortDate")
         }
     }).then((results)=>{

        if(!results.length){
            res.status(401).send(
                createJsonResponse(1, "Deliveries not  found for the provided date", { token: authData.token})
              ); 
        }else{
            res.status(200).send(
                createJsonResponse(0, "Deliveries found", { token: authData.token, results:results})
              ); 
        }
       
     })

    }catch(e){
        res.status(500).send(
            createJsonResponse(0, "An error ocurred", { error: e, token: authData.token})
          ); 
    }
});


/***
 *                 _                                         
 *       __ _  ___| |_   _ __ _____   _____ _ __  _   _  ___ 
 *      / _` |/ _ \ __| | '__/ _ \ \ / / _ \ '_ \| | | |/ _ \
 *     | (_| |  __/ |_  | | |  __/\ V /  __/ | | | |_| |  __/
 *      \__, |\___|\__| |_|  \___| \_/ \___|_| |_|\__,_|\___|
 *      |___/                                                
 */
userRouters.get("/getrevenue",auth, async (req, res) => {
    const reqData = req.body;
     const authData = req.userAuthData;
    try {
        if(req.userAuthData.group !== 1){
            res.status(401).send(
                createJsonResponse(0, "No revenue for your account type",{token: authData.token})
               ); 
         }


     Delivery.sum("cost",{
         where: {
         courierId : authData.id,
          date: { 
  
           [Op.between]: [ dateFormat(reqData.fromDate, "isoDate"), dateFormat(reqData.toDate, "isoDate")]
          }
         }
     }).then(sum=>{
        
        if(!sum){
            res.status(401).send(
                createJsonResponse(0, "Deliveries not  found for the provided date", { token: authData.token})
              ); 
        }else{
            res.status(200).send(
                createJsonResponse(0, "Found total revenue for the provided date range", { token: authData.token, revenue:sum})
              ); 
        }
       
     })

    }catch(e){
        res.status(500).send(
            createJsonResponse(0, "An error ocurred", { error: e, token: authData.token})
          ); 
    }
});


userRouters.post("/users/create" , async (req, res) => {
   const dataForNewUser = await createUserFunction(req.body);
    res.status(200).send(
        createJsonResponse(1, "New user created")
     );
})

module.exports = userRouters;