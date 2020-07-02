const JWT = require('jsonwebtoken');
const configData = require('../../config/env');
const User = require("../models/User");
const auth = async (req, res, next) => {

    const tokenProvided = req.headers["authorization"];

    if(tokenProvided){

        try{
        let decoded = JWT.verify(tokenProvided, configData.jwtArray.secretKey);
       
        User.findOne({
            where: {
                id: decoded.id,
                tokenSecret: tokenProvided
            }
        }).then((user) => {
            if(!user){
              return  res.status(401).send({
                    status: 0,
                    error: "User not found"
                  });
            }else{
                decoded.token = tokenProvided;
                req.userAuthData = decoded;
                next();
            }
        })
        }catch(e){
                res.status(500).send({
                    status: 0,
                    error: "An error ocurred",
                    description: e
                  }); 
            }
    }else{
        res.status(401).send({
            status: 0,
            error: "No token"
          });
    }

}

module.exports = auth ;