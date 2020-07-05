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

const v1routers = new express.Router();
const auth = require("../middleware/jwt-middleware")
const { createUserFunction, createJsonResponse} = require("../db/functions/user"); 

/***
 *      _             _       
 *     | | ___   __ _(_)_ __  
 *     | |/ _ \ / _` | | '_ \ 
 *     | | (_) | (_| | | | | |
 *     |_|\___/ \__, |_|_| |_|
 *              |___/         
 */
v1routers.post("/api/v1/login" , async (req, res) => {
    const reqData = req.body;

    try {
        const loggedInUser = await User.findOne({
            where: {
                username: reqData.username
            }
        })

        if(loggedInUser){
            // checking if provided password is valid
            const isTokenMatch = await  bcrypt.compareSync(reqData.password, loggedInUser.password );

            
            if(isTokenMatch){
                // creating token for the user
                const userToken = await JWT.sign({
                    id: loggedInUser.id,
                    group: loggedInUser.group,
                }, configData.jwtArray.secretKey,{
                    expiresIn: configData.jwtArray.expiresIn
                })

                //Updating user with new token
                User.update({ tokenSecret: userToken }, {
                    where: {
                        id: loggedInUser.id
                    }
                  });
                  
                // sending response 
                res.status(200).send(
                    createJsonResponse(1, "Login OK", {token: userToken})
                ); 

            }
           
        }else{
           // user don't exist
           res.status(401).send(
            createJsonResponse(0, "User not found")
            );
        }
       
    } catch (e) {
         res.status(500).send(
            createJsonResponse(0, "An error ocurred", {error: e})
           );
    }

})

/***
 *                _     _       _      _ _                      
 *       __ _  __| | __| |   __| | ___| (_)_   _____ _ __ _   _ 
 *      / _` |/ _` |/ _` |  / _` |/ _ \ | \ \ / / _ \ '__| | | |
 *     | (_| | (_| | (_| | | (_| |  __/ | |\ V /  __/ |  | |_| |
 *      \__,_|\__,_|\__,_|  \__,_|\___|_|_| \_/ \___|_|   \__, |
 *                                                        |___/ 
 */
v1routers.post("/api/v1/adddelivery",auth, async (req, res) => {
    const reqData = req.body;
    const authData = req.userAuthData;
   try {
        if(req.userAuthData.group !== 2){
            res.status(401).send(
                createJsonResponse(0, "Don't have permission to add deliveries",{token: authData.token})
            ); 
        }
        const newDelivery =  await Delivery.create({
            packageSize: reqData.packageSize,
            cost: reqData.cost,
            description: reqData.description,
            date: dateFormat(reqData.date, "isoDate"),
            senderId:  authData.id
        })

        res.status(200).send(
            createJsonResponse(1, "New delivery created successfully",{deliveryId: newDelivery.id, token: authData.token})
            ); 

   } catch (e) {
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
v1routers.patch("/api/v1/assigndelivery",auth, async (req, res) => {
    const reqData = req.body;
    const authData = req.userAuthData;

    try {
        if(req.userAuthData.group !== 2){
            res.status(401).send(
                createJsonResponse(0, "Don't have permission to assign deliveries",{token: authData.token})
               ); 
         }
    
           // check if sender is the delivery owner + the delivery wasn't delivered yet
          const requestedDelivery = await  Delivery.findOne({
                where: {
                    senderId: authData.id,
                    id: reqData.deliveryId,
                    isCompleted: false
                }
            })

            // if delivery not fond (According to arguments provided in the query)
            if(!requestedDelivery){
                res.status(401).send(
                    createJsonResponse(0, "Requested delivery not found in your data OR already delivered",{token: authData.token})
                   ); 
            }
            
            // Checking that the provider courier haven't acceeded the maximum allowed per day
            const courierTotalDeliveries = await Delivery.count({
                where: {
                    courierId: reqData.courierId,
                    date: requestedDelivery.date
                }
            })

            if(courierTotalDeliveries >= configData.settingsArray.maxDeliveriesPerDayForCouriers){
                res.status(401).send(
                    createJsonResponse(0, "Can't assign delivery to this Courier because he accedded the maximum per day",{token: authData.token})
                ); 
            }

            // If courier can deliver the requested delivery

            const assignTheDelivery = await Delivery.update( {courierId: reqData.courierId},{
                where: {
                    id: reqData.deliveryId,
                }
            });

            res.status(200).send(
                createJsonResponse(1, "Delivery assigned to the provided courier",{token: authData.token})
            ); 

    } catch (e) {
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
v1routers.get("/api/v1/getdeliveries",auth, async (req, res) => {
    const reqData = req.body;
     const authData = req.userAuthData;
    try {
        
    const allDeliveries = await  Delivery.findAll({
        where: {
           [(req.userAuthData.group === 2)?'senderId':'courierId']  : authData.id,
           date: dateFormat(reqData.date, "isoDate")
        }
    });
 
    if(!allDeliveries.length){
        res.status(401).send(
            createJsonResponse(1, "Deliveries not  found for the provided date", { token: authData.token})
          );
    }else{
        res.status(200).send(
            createJsonResponse(0, "Deliveries found", { token: authData.token, results: allDeliveries})
        ); 
    }
    


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
v1routers.get("/api/v1/getrevenue",auth, async (req, res) => {
    const reqData = req.body;
     const authData = req.userAuthData;
    try {

        if(req.userAuthData.group !== 1){
            res.status(401).send(
                createJsonResponse(0, "No revenue for your account type",{token: authData.token})
               ); 
               return;
         }


         const totalRevenue = await  Delivery.sum("cost",{
            where: {
            courierId : authData.id,
             date: { 
              [Op.between]: [ dateFormat(reqData.fromDate, "isoDate"), dateFormat(reqData.toDate, "isoDate")]
             }
            }
        });

        if(!totalRevenue) {
            res.status(201).send(
                createJsonResponse(0, "Deliveries not  found for the provided date", { token: authData.token})
              ); 
        }else{
            res.status(200).send(
                createJsonResponse(0, "Found total revenue for the provided date range", { token: authData.token, revenue:totalRevenue})
              ); 
        }
    }catch(e){
        res.status(500).send(
            createJsonResponse(0, "An error ocurred", { error: e, token: authData.token})
          ); 
    }
});


v1routers.post("/api/v1/users/create" , async (req, res) => {
   const dataForNewUser = await createUserFunction(req.body);
    res.status(200).send(
        createJsonResponse(1, "New user created")
     );
})

module.exports = v1routers;