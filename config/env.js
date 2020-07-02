module.exports={
    network:{
        port: 3000
    },
    dbArray:{
        dbName:'delivery_management',
        user: 'root', 
        pass: 'Gardel10',
    },
    jwtArray:{
        secretKey: "delivery-management",
        expiresIn: 600000
    },
    bcryptArray:{
        saltRounds: 10,
    },
    settingsArray:{
        maxDeliveriesPerDayForCouriers: 5,
    }
}