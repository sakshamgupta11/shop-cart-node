// const getDb = require('../util/database').getDb;

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title:{
    type:String,
    required:true
  },
  price:{
    type:Number,
    required:true
  },
  description:{
    type:String,
    required:true
  },
imageUrl:{
  type:String,
  required:true
},
UserId:{
  type:Schema.Types.ObjectId,
  ref:"User",
  required:true
}
});

module.exports =mongoose.model("Product",productSchema);
// const mongodb = require('mongodb');

// class Product {
//   constructor(title, price, description, imageUrl,userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl; 
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();  
//     return db
//       .collection('products')
//       .insertOne(this)
//       .then(result => {
//         console.log(result);
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection('products')
//       .find()
//       .toArray()
//       .then(products => {
//         console.log(products);
//         return products;
//       })
//       .catch(err => {
//         console.log(err);
//       });
//   }

//   static getEdit(id){
//     const db = getDb();
//     return db
//     .collection("products")
//     .find({ _id: new mongodb.ObjectId(id) })
//     .toArray()
//     .then(products=>{
//       console.log(products);
//       return products;
      
//     })
//     .catch(err=>{
//       console.log(err);
      
//     })
//   }
//   static findById(prodId){
//     const db = getDb();
//     return db 
//     .collection("products")
//     .findOne({_id: new mongodb.ObjectId(prodId)})
//     .then(products=>{
//       console.log(products);
//       return products;
      
//     })
//     .catch(err=>{
//       console.log(err);
      
//     })
//   }

//    updateEditProduct(prodId){
//     const db = getDb();
//       return db
//       .collection("products")
//    .updateOne(
//   { _id: new mongodb.ObjectId(prodId) },
//   {
//     $set: { title:this.title,price:this.price,description:this.description,imageUrl:this.imageUrl}
//   }
// );
//   }

//   static DeleteProduct(prodId){
//       if (!mongodb.ObjectId.isValid(prodId)) {
//     throw new Error('Invalid product id');
//   }

//     const db = getDb();
//     return db.collection("products").deleteOne({_id: new mongodb.ObjectId(prodId)});
//   }
// }



// module.exports = Product;
