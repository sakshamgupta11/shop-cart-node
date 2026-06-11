const Product = require('../models/product');
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const product = require('../models/product');

const ITEMS_PER_PAGE = 3;

exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1
  let totalItems;

  Product.find()
    .countDocuments().then(numProducts => {
      totalItems = numProducts;
      return Product.find().skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
            currentPage:page,
        hasNextPage:ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page>1,
        nextPage: page+1,
        previousPage :page -1,
        lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1
  let totalItems;

  Product.find()
    .countDocuments().then(numProducts => {
      totalItems = numProducts;
      return Product.find().skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
    })

    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage:page,
        hasNextPage:ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page>1,
        nextPage: page+1,
        previousPage :page -1,
        lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user.getCart()
    .then(products => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => console.log(err));
}

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId).then(product => {
    return req.user.addToCart(product);

  }).then(result => {
    res.redirect("/cart")


  })
  // let fetchedCart;
  // let newQuantity = 1;
  // session.
  //   .getCart()
  //   .then(cart => {
  //     fetchedCart = cart;
  //     return cart.getProducts({ where: { id: prodId } });
  //   })
  //   .then(products => {
  //     let product;
  //     if (products.length > 0) {
  //       product = products[0];
  //     }

  //     if (product) {
  //       const oldQuantity = product.cartItem.quantity;
  //       newQuantity = oldQuantity + 1;
  //       return product;
  //     }
  //     return Product.findById(prodId);
  //   })
  //   .then(product => {
  //     return fetchedCart.addProduct(product, {
  //       through: { quantity: newQuantity }
  //     });
  //   })
  //   .then(() => {
  //     res.redirect('/cart');
  //   })
  //   .catch(err => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  console.log(prodId);

  req.user.deleteCartByCount(prodId)
    .then(result => {
      console.log(result);

      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postCartAddProduct = (req, res, next) => {
  const prodId = req.body.productId;
  console.log(prodId);

  req.user.AddCartQuantity(prodId).then(result => {
    res.redirect("/cart");
  })
    .catch(err => {
      console.log(err);

    })
}

exports.cartDelete = (req, res, next) => {
  const prodId = req.body.productId
  req.user.deleteCart(prodId).then(result => {
    res.redirect("/cart")
  }).catch(err => {
    console.log(err);

  })
}
exports.postOrder = (req, res, next) => {
  req.user.orderCreated().then(result => {
    res.redirect("/orders")
  }).catch(err => {
    console.log(err);

  })
  //   try {

  //     const user = await req.user.populate('cart.items.productId');

  //     const products = user.cart.items.map(item => {
  //       return {
  //         quantity: item.quantity,
  //         product: item.productId ? { ...item.productId._doc } : null
  //       };
  //     });


  //     const order = new Order({
  //       user: {
  //         name: req.user.name,
  //         email: req.user.email,
  //         userId: req.user._id
  //       },
  //       products: products
  //     });

  //     console.log('STEP 4 order before save:', JSON.stringify(order, null, 2));

  //     const result = await order.save();
  //     console.log('STEP 5 saved:', result);

  //     res.redirect('/orders');
  //   } catch (err) {
  //     console.log('ORDER ERROR FULL:', err);
  //     res.redirect('/cart');
  //   }
  // };
}
exports.getOrders = (req, res, next) => {
  req.user
    .getOrder()
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};



exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId).then(order => {
    if (!order) {
      return next(new Error('no orderfound'))
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error("Unauthorized"))
    }

    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join("data", "invoices", invoiceName);
    const pdfDoc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoiceName}"`);
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);
    pdfDoc.fontSize(18).text("Invoice", {
      underline: true,
      align: 'center'
    });

    pdfDoc.text("....................................", {
      align: 'center'
    });
    pdfDoc.fontSize(12).text(
      `order id, ${order._id.toString()}`, {
      align: 'center'
    }
    )
    let totalPrice = 0;
    order.products.forEach(prod => {
      console.log(prod);

      totalPrice += prod.quantity * prod.product.price;
      pdfDoc.fontSize(12).text(
        ` ${prod.product.title} - ${prod.quantity} x $ ${prod.product.price} `, {
        align: 'center'
      }
      )

    })
    pdfDoc.text()
    pdfDoc.fontSize(18).text(` totalPrice ${totalPrice}`, {
      align: 'center'
    })

    pdfDoc.end();


    //   fs.readFile(invoicePath,(err,data)=>{
    //     if(err){
    //       return next(err)
    //     }
    //  res.setHeader('Content-Type', 'application/pdf');
    //     res.setHeader('Content-Disposition', `attachment; filename="${invoiceName}"`);
    //     res.setHeader('Content-Length', data.length);

    //     res.send(data);
    // })

    // const file = fs.createReadStream(invoicePath);
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', `attachment; filename="${invoiceName}"`);
    // file.pipe(res);

  }).catch(err => {
    console.log(err);

  })

}