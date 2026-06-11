const mongoose = require("mongoose");
const Product = require('../models/product');
const Order = require("../models/order");
const product = require("../models/product");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  // name:{
  //   type:String,
  //   require:true
  // },
  email:{
   type:String,
    required:true
  },
  password:{
    type:String,
    require:true
  },
  resetToken: String,
  resetTokenExpiration:Date,
  isAdmin: {
  type: Boolean,
  default: false
},
  cart:{
    items:
    [{
      productId:
      {
        type: Schema.Types.ObjectId,
        ref:"Product",
        required:true
      },
      quantity:
      {
        type: Number,
    required:true
  }}
]
  }
})

  userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
      return cp.productId.toString() === product._id.toString();

    });

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    }
    else {
      updatedCartItems.push({
        productId: product._id,
        quantity: newQuantity
      })
    }
    const updatedCart = { items: updatedCartItems };
this.cart = updatedCart;
return this.save();
  }

userSchema.methods.getCart = async function() {
  try {
    const productsIds = await  this.cart.items.map(i=>i.productId);
    const products = await Product.find({_id :{$in :productsIds}});
return products.map(p=>{
  const cartItem = this.cart.items.find(i=>{
    return i.productId.toString() === p._id.toString();
  })
  return {
    productData : p,
    quantity: cartItem.quantity

  }
})
  } catch (error) {
    console.log(error);
    return [];
  }
  
};

userSchema.methods.AddCartQuantity = function(prodId) {
  const cartItem = this.cart.items.find(p=>{
    return p.productId.toString() === prodId.toString()
  })
  if(!cartItem){
    console.log("product not found");
    
  }
  cartItem.quantity = cartItem.quantity  + 1
  return this.save()
};

userSchema.methods.deleteCartByCount = function(prodId){
 const cartItem = this.cart.items.find(p=>{
  return p.productId.toString() === prodId.toString()
 })
 if(!cartItem){
  console.log("product not found");
  
 }
 const newQuantity = cartItem.quantity -1;
 if(newQuantity <=0){
  this.cart.items = this.cart.items.filter(item=>{
    return item.productId.toString()!== prodId.toString()
  })
}
  else{
cartItem.quantity = newQuantity
  }
  
  return this.save()
 
}

userSchema.methods.deleteCart = function(prodId){
const cartItem = this.cart.items.find(p=>{
  return p.productId.toString() === prodId.toString();
})
if(!cartItem){
  console.log("user not found");
  
}
else{
 this.cart.items = this.cart.items.filter(item => {
    return item.productId.toString() !== prodId.toString();
   
  });
}
return this.save()
}
userSchema.methods.orderCreated = function () {
  const cartItems = this.cart.items.filter(i => i.quantity > 0);

  if (!cartItems.length) {
    return Promise.reject(new Error("cart is empty"));
  }

  return Promise.all(
    cartItems.map(item => {
      return Product.findById(item.productId).then(product => {
        if (!product) {
          return Promise.reject(new Error("product not found"));
        }

        return {
          product: product,
          quantity: item.quantity
        };
      });
    })
  )
    .then(products => {
      const order = new Order({
        products: products,
        user: {
          email: this.email,
          userId: this._id
        }
      });

      return order.save().then(()=>{
        this.cart.items = [];
        return this.save();
      })
    })
    .catch(err => {
      console.log(err);
    });
};userSchema.methods.getOrder = function () {
  return Order.find({ "user.userId": this._id })
    .select("products updatedAt")
    .sort({ updatedAt: -1 })
    .then(data => {
      const orderWithTotal = data.map(order => {
        let orderTotal = 0;

        const productsWithTotal = order.products.map(item => {
          const getPrice = item.product.price;
          const getQty = item.quantity;
          const itemTotal = getPrice * getQty;

          orderTotal += itemTotal;

          return {
            ...item._doc,
            itemTotal: itemTotal
          };
        });

        return {
          ...order._doc,
          products: productsWithTotal,
          orderTotal: orderTotal
        };
      });

      return orderWithTotal;
    })
    .catch(err => {
      console.log(err);
    });
};
module.exports = mongoose.model("User",userSchema);
// const { getDb } = require('../util/database');
// const mongodb = require('mongodb');

// const ObjectId = mongodb.ObjectId;

// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id
//   }



//   save() {
//     const db = getDb();
//     return db.collection('users').insertOne(this);
//   }


//   getCart() {
//     const db = getDb();
//     const productIds = this.cart.items.map(i => {

//       return i.productID

//     })
//     return db.collection("products").find({ _id: { $in: productIds } }).toArray().then(products => {
//       return products.map(p => {
//         return {
//           ...p, quantity: this.cart.items.find(i => {
//             return i.productID.toString() === p._id.toString();
//           }).quantity
//         };
//       })
//     })
//   }



//   deleteCart(prodId) {
//     const updatedCartItems = this.cart.items.filter(item => {
//       return item.productID.toString() !== prodId.toString();
//     });

//     const db = getDb();

//     return db.collection("Users").updateOne({ _id: new ObjectId(this._id) }, {
//       $set: { cart: { items: updatedCartItems } }
//     })
//   }




//   deleteCartByCount(prodId) {

//     const cartItem = this.cart.items.find(item => {
//       return item.productId.toString() === prodId.toString();
//     });

//     if (!cartItem) {
//       return Promise.reject("Item not found");
//     }

//     const newQuantity = cartItem.quantity - 1;

    
//     if (newQuantity <= 0) {

//       return Product.findById(prodId).then(products=>{
//         products.items = []
//         return product.save();
//       })

//     }
      

// return User.updateOne(
//    { _id:prodId},
//    { $set: { quantity: newQuantity } }
//   )

//   }
//   AddCartQuantity(prodId) {
//     const cartItem = this.cart.items.find(item => {
//       return item.productID.toString() === prodId.toString();
//     });

//     if (!cartItem) {
//       return Promise.reject("Item not found");
//     }

//     const newQuantity = cartItem.quantity + 1;

//     const db = getDb();
//     return db.collection("Users").updateOne(
//       {
//         _id: new ObjectId(this._id),
//         "cart.items.productID": new ObjectId(prodId)
//       },
//       {
//         $set: {
//           "cart.items.$.quantity": newQuantity
//         }
//       }
//     );


//   }

//   addOrder(){
//   const db = getDb();
//  return this.getCart().then(products=>{
// const now = new Date();
//     const order = {
//     items: products,
//     user: {
//       _id: new ObjectId(this._id),
//       name: this.name,
//       email: this.email
//     },
//     status:"pending",
//     createdAt:now,
//     updatedAt:now
//   };
//   return db.collection("orders").insertOne(order)
//   })

//   .then(result=>{
// this.cart = {items: []};
//     return db.collection("Users").updateOne({ _id: new ObjectId(this._id) }, {
//       $set: { cart: { items: [] } }
//     })
//   }
 
//   )
// }

// getOrders(){
// const db = getDb();
// return db.collection("orders").find({'user._id': ObjectId(this._id)},
// {projection:{'items.price':1,'items.title':1,"items.quantity":1,updatedAt:1}}
// ).toArray()
// }

//   static findById(userId) {
//     const db = getDb();
//     return db.collection('Users').findOne({ _id: new ObjectId(userId) })
//       .then(result => {
//         return result
//       })
//       .catch(err => {
//         console.log(err);

//       })
//   }
// }

// module.exports = User;