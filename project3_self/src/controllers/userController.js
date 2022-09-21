const userModel = require("../models/userModel");
const jwt = require('jsonwebtoken')
const createUser = async function (req, res) {
    try {
        let data = req.body;
        let saveData = await userModel.create(data);
        res.send({ saveData });
    } catch (error) {
        res.send(error.message)
    }
}

const login = async function (req, res) {
    try {
        let email = req.body.email;
        let password = req.body.password;
        let user = await userModel.findOne({ email: email, password: password });
        if (!user) return res.send("Wrong credentials");
        let token = await jwt.sign({ id: user._id.toString() }, "This is secret key for project3", { expiresIn: '24h' })

        res.header({ "x-api-key": token })
        res.status(200).send({ status: true, msg: "Login Successful", data: token })
    } catch (error) {
        res.send(error.message);
    }
}


module.exports.createUser = createUser;
module.exports.login = login;