const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetch = require('cross-fetch');
require('dotenv').config();

const route = express.Router();

route.use(express.json());
route.use(express.urlencoded({ extended: true }));

route.post('/register', (req, res) => {

    const registeringUser = {
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
    };

    fetch('http://localhost:8081/admin/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(registeringUser)
    })
    .then(res => res.json())
        .then(rows => {

            const user = {
                id: rows.id,
                username: rows.username,
                privilege: rows.privilege
            };
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            res.json({token: token});
        })
        .catch(err => res.status(500).json(err));
});

module.exports = route;