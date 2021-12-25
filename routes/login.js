const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetch = require('cross-fetch');
const Joi = require('joi');
require('dotenv').config();

const route = express.Router();

route.use(express.json());
route.use(express.urlencoded({ extended: true }));

route.post('/login', (req, res) => {

    const validationText = Joi.object().keys({
        username: Joi.string().min(3).max(12).required(),
        password: Joi.string().min(4).max(12).required()
    });

    Joi.validate(req.body, validationText, (err, result) => {
        if(err){
            res.send({message: err.details[0].message});
        }
        else{
            const logingUser = {
                username: req.body.username
            }
            
            fetch('http://localhost:8081/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logingUser)
            })
            .then(res => res.json())
                .then(rows => { 
                    
                    if(bcrypt.compareSync(req.body.password, rows.password)) {
                        const user = {
                            id: rows.id,
                            username: rows.username,
                            privilege: rows.privilege
                        };
                
                        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
                        res.json({token: token});
        
                    } else {
                        res.status(400).json({message: "Invalid credentials"});
                    }
                })
                .catch(err => res.status(500).json(err));
        }
    })

});

module.exports = route;