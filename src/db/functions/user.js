const bcrypt = require('bcrypt');
require('../connection');
const configData = require('../../../config/env');

const User = require("../../models/User");
const Sender = require("../../models/Sender");
const Courier = require("../../models/Courier");


const createUserFunction = async (data)=>{
    const hashedPass= bcrypt.hashSync(data.password, configData.bcryptArray.saltRounds);
    const newDAtaForUser = {username: data.username, password:hashedPass ,  group: data.group};

    const newUser = await User.create(newDAtaForUser)
    .catch((e)=>{
        console.error(e)
    }).then((newUser)=>{
        if(data.group === 1){
            const newDataForCourier = {userId: newUser.id, firstName: data.firstName,  lastName: data.lastName, phoneNumber: data.phoneNumber, vehicleType: data.vehicleType };
             Courier.create(newDataForCourier).catch((e)=>{
                console.error(e)
            }).then((newCourier)=>{
                console.log(newCourier);
            })
        }else if(data.group === 2){
            const newDataForSender = {userId: newUser.id, companyName: data.companyName};
           Sender.create(newDataForSender).catch((e)=>{
                console.error(e)
            }).then((newSender)=>{
                console.log(newSender);
            })
        }
    })

    return newUser;
}

const createJsonResponse =   (status, message, data) => {
    const theJson = {
        status:status,
        message: message,
        data: data
     }

     return theJson;
}



const loginUserFunction = async (data) => {

    User.findOne({
        where: {
            username: data.username
        }
    }).then((user) => {
        if(user){
            if( bcrypt.compareSync(data.password, user.password )){
                // user can login
            }else{
                // data not match
            }

        }else{
            // data not match
        }

    }).catch((e)=>{
        console.error(e);
    })


};



module.exports = {
    createUserFunction,
    createJsonResponse
}