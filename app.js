const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

var corsOptions = {
    origin: 'http://localhost:8080',
    optionsSuccessStatus: 200
}

app.use(express.json());
app.use(cors(corsOptions));

app.post('/register', (req, res) => {

    const registeringUser = {
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
    };

    fetch('http://localhost:8081/admin/users-register', {
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

app.post('/login', (req, res) => {

    const logingUser = {
        username: req.body.username
    }

    fetch('http://localhost:8081/admin/users-login', {
        headers: {
            'Content-Type': 'application/json'
        },
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
});

app.listen(8082);