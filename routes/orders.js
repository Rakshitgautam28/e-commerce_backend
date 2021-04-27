const express = require('express');
const router = express.Router();
var cors = require('cors');
const {database} = require('../config/helpers');
router.use(express.json());

/* GET all orders */
router.get('/', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader( "Access-Control-Allow-Methods", "GET" );
    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id','p.title as name', 'p.description', 'p.price', 'u.username'])
        .getAll()
        .then(orders => {
            if(orders.length > 0) {
                res.status(200).json(orders);
            }
            else{
                res.json({message: 'No orders found'});
            }
        }).catch(err => console.log(err));
});

/* GET single order */
router.get('/:id', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader( "Access-Control-Allow-Methods", "GET" );
    const orderId = req.params.id;

    database.table('orders_details as od')
        .join([
            {
                table: 'orders as o',
                on: 'o.id = od.order_id'
            },
            {
                table: 'products as p',
                on: 'p.id = od.product_id'
            },
            {
                table: 'users as u',
                on: 'u.id = o.user_id'
            }
        ])
        .withFields(['o.id','p.title as name', 'p.description', 'p.price', 'p.image', 'od.quantity as quantityOrdered'])
        .filter({'o.id' : orderId})
        .getAll()
        .then(orders => {
            if(orders.length > 0) {
                res.status(200).json(orders); //error here 5,3:41
            }
            else{
                res.json({message: `No orders found with orderId ${orderId}`});
            }
        }).catch(err => console.log(err));
});

/* Place a new order */
router.options('/new', cors());
router.post('/new',cors(), (req, res) => {
    let {userId, products} = req.body;
    console.log(userId, products);
    if (userId !== null && userId > 0) {
        database.table('orders')
            .insert({
                user_id: userId
            }).then((newOrderId) => {

            if (newOrderId > 0) {
                products.forEach(async (p) => {

                    let data = await database.table('products').filter({id: p.id}).withFields(['quantity']).get();
                    let inCart = parseInt(p.incart);

                    // Deduct the number of pieces ordered from the quantity in database

                    if (data.quantity > 0) {
                        data.quantity = data.quantity - inCart;

                        if (data.quantity < 0) {
                            data.quantity = 0;
                        }

                    } else {
                        data.quantity = 0;
                    }

                    // Insert order details w.r.t the newly created order Id
                    database.table('orders_details')
                        .insert({
                            order_id: newOrderId,
                            product_id: p.id,
                            quantity: inCart
                        }).then(newId => {
                        database.table('products')
                            .filter({id: p.id})
                            .update({
                                quantity: data.quantity
                            }).then(successNum => {
                        }).catch(err => console.log(err));
                    }).catch(err => console.log(err));
                });

            } else {
                res.json({message: 'New order failed while adding order details', success: false});
            }
            res.json({
                message: `Order successfully placed with order id ${newOrderId}`,
                success: true,
                order_id: newOrderId,
                products: products
            })
        }).catch(err => res.json(err));
    }

    else {
        res.json({message: 'New order failed', success: false});
    }

});

/* fake payment gateway call */
router.options('/payment', cors());
router.post('/payment',cors(), (req, res) => {
    setTimeout(() => {
        res.status(200).json({success: true});
    }, 3000)
});

module.exports = router;
