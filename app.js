const app = require('express')();
const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');


const { execQuery } = require('./db');


/**
 * Middlewares 
 **/
app.use(cors());
app.use(bodyParser.json())



/**
 *(A) Users registeration (testing done)
 */
app.post('/register', function (req, res) {

    if (!req.body.name || !req.body.email || !req.body.password) return res.json({
        "message": "Invalid request!"
    });
    let query = `
        INSERT INTO users (name,email,password) values (?,?,?);
    `;

    execQuery(query, [req.body.name, req.body.email,req.body.password])
        .then(async (result) => {
            return res.json({
                "message": "Registration Successfull"
            });

        })
        .catch(error => {
            return res.json({
                "message": "Error in Registration"
            });
        });
});


/**
 *(A) Edit user profile
 */
app.post('/edit-profile', function (req, res) {

    if (!req.body.name ) return res.json({
        "message": "Invalid request!"
    });
    let query = `
        UPDATE users SET name = ? WHERE id = ?;
    `;

    execQuery(query, [req.body.name,req.body.id])
        .then(async (result) => {
            return res.json({
                "message": "Updated Successfull"
            });

        })
        .catch(error => {
            return res.json({
                "message": "Error in updation"
            });
        });
});

/**
 *(C) User Login
 */
app.post('/login', function (req, res,next) {

    if (!req.body.email || !req.body.password) return res.json({
        "message": "Invalid request!"
    });
    let query = `
        SELECT * FROM users WHERE email = ?;
    `;

    execQuery(query, [req.body.email])
        .then(async (user) => {
            console.log("useerrrrrrrrrrrr",user);
            if(!user) return res.json({
                "message": "Invalid user!"
            });

            if(!req.body.password == user[0].password) return res.json({
                "message": "Invalid login credentials"
            });


            //Generating token using jwt
            let token = jwt.sign({
                userid: user[0].id,
                email: user[0].email,
                iat: Math.floor(Date.now() / 1000)
            },'This-is-password-to-encrypt');

            query = `UPDATE users SET token = ? WHERE id = ?`;
            execQuery(query,[token,user[0].id])
                .then((result) => {
                    return res.json({
                        "token": token,
                        "message": "Logged in succefully"
                    });

                }).catch((error) => {
                    return res.json({
                        "message": "Login failed. Try again!"
                    })
                });

        })
        .catch(error => {
            return res.json({
                "message": "Login failed. Try again!"
            });
        });
});


/**
 *(D) Logout
 */
app.post('/logout', function (req, res) {
    if(!req.headers.token ) 
    // console.log(req.header)
    return res.json({
        "message": "Token not found"
        
    })
    
    jwt.verify(req.headers.token,'This-is-password-to-encrypt',(err,payload) => {
        if(err) {
            console.log("Token could not be varified:",err);
            return res.json({
                "message": "Invalid token"
            },);
            
        }
        let query = `UPDATE users SET token = null WHERE id = ?`;
        execQuery(query,[payload.id])
            .then(async (result) => {
                return res.json({
                    "result": "Logout successfully"
                });
            })
            .catch(error => {
                return res.json({
                    "message": "Error in logging out"
                });
            });
    });
});

/**
 *(E) Api list of products
 */
app.get('/product', function (req, res) {

    
    let searchKey = (req.query.searchKey) ? `%${req.query.searchKey}%` : true;
    let query = `
        SELECT product_name,product_type
        FROM products
        where product_name = '${searchKey}';
        `;
        // where product_name = 'shirt';
    execQuery(query)
        .then(async (result) => {
            return res.json({
                "result": result
            });
        })
        .catch(error => {
            return res.json({
                "message": "Error in getting data"
            });
        });
});



/**
 *(F) Api for add to cart products
 */

app.post('/addtocart', function (req, res) {

    if (!req.body.user_id || !req.body.product_id) return res.json({
        "message": "Invalid request!"
    });
    let query = `
        INSERT INTO cart (user_id,product_id) values (?,?);
    `;

    execQuery(query, [req.body.user_id, req.body.product_id])
        .then(async (result) => {
            return res.json({
                "message": "record inserted successfully"
            });

        })
        .catch(error => {
            return res.json({
                "message": "Error in inserting into cart"
            });
        });
});


/**
 *(G) Api for order products
 */

app.post('/order', function (req, res) {

    if (!req.body.user_id || !req.body.product_id || !req.body.status) return res.json({
        "message": "Invalid request!"
    });
    let query = `
        INSERT INTO orders (user_id,product_id,status) values (?,?,?);
    `;

    execQuery(query, [req.body.user_id, req.body.product_id, req.body.status])
        .then(async (result) => {
            return res.json({
                "message": "order confirmed"
            });

        })
        .catch(error => {
            return res.json({
                "message": "Error in place order"
            });
        });
});


/**
 *(H) Api for display cart
 */

app.get('/display-cart', function (req, res) {

    let query = `
    SELECT * FROM cart c
    INNER JOIN products p ON p.id = c.product_id
    where c.user_id = ?;  
    `;
    execQuery(query,[req.query.userid])
        .then(async (result) => {
            return res.json({
                "result": result
            });
        })
        .catch(error => {
            return res.json({
                "message": "Error in getting data"
            });
        });
});

/**
 *(I) Api for display order
 */

app.get('/display-order', function (req, res) {

    let query = `
    SELECT * FROM orders
    INNER JOIN products ON
    products.id=orders.product_id
    where orders.user_id= 1;
    `;
    execQuery(query,[req.query.userid])
        .then(async (result) => {
            return res.json({
                "result": result
            });
        })
        .catch(error => {
            return res.json({
                "message": "Error in getting data"
            });
        });
});

/**
 * Admin side
 */
/**
 *(J)  Api for inserting new products
 */
app.post('/add-product', function (req, res) {

    if (!req.body.product_name || !req.body.product_type) return res.json({
        "message": "Invalid request!"
    });
    let query = `
        INSERT INTO products (product_name,product_type) values (?,?);
    `;

    execQuery(query, [req.body.product_name, req.body.product_type])
        .then(async (result) => {
            return res.json({
                "message": "record inserted successfully"
            });

        })
        .catch(error => {
            return res.json({
                "message": "Error in inserting new products"
            });
        });
});


/**
 *(K) Api list of products
 */
app.get('/product_a', function (req, res) {

    let query = `
        SELECT product_name,product_type
        FROM products
    `;
    execQuery(query)
        .then(async (result) => {
            return res.json({
                "result": result
            });
        })
        .catch(error => {
            return res.json({
                "message": "Error in getting data"
            });
        });
});

/**
 * view order apply
 */

app.get('/view-order', function (req, res) {

    let query = `
        SELECT product_name,product_type
        FROM products
    `;
    execQuery(query)
        .then(async (result) => {
            return res.json({
                "result": result
            });
        })
        .catch(error => {
            console.error(error);
            return res.json({
                "message": "Error in getting data"
            });
    });
});




/**
 * Server startup code
 */
const port = process.env.PORT || 3000;
http.listen(port, function () {
    console.log('server is listening on port:' + port);
});