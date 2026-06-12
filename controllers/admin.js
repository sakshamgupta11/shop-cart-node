const Product = require('../models/product');
const User = require("../models/user");
const { validationResult } = require("express-validator");
const monsoose = require("mongoose");
const { unlinkFile } = require("../util/unlinkFile");
const ITEMS_PER_PAGE = 3;
exports.getAddProduct = (req, res, next) => {

  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    errorMessage: null,
    hasError: false,
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;
  // console.log(image);

  if (!image) {
    return res.status(422).render('admin/edit-product', {
      path: '/admin/add-product',
      pageTitle: 'add-product',
      editing: false,
      hasError: true,
      errorMessage: "attched file is not a image",
      product: { title: title, price: price, description: description, imageUrl: image, UserId: req.user }
    });
  }
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      path: '/admin/add-product',
      pageTitle: 'add-product',
      editing: false,
      hasError: true,
      errorMessage: error.array()[0].msg,
      product: { title: title, price: price, description: description, imageUrl: image, UserId: req.user }
    });
  }

  const imageUrl = image.path;
  console.log(imageUrl);


  const product = new Product({ title: title, price: price, description: description, imageUrl: imageUrl, UserId: req.user });
  product
    .save()
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.error(err);
      console.log("something went wrong in creating new product..");
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

}


exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(products => {
      if (!products) {
        return res.redirect('/');
      }

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        errorMessage: null,
        product: products
      });
    })
    .catch(err => {
      console.log("something went wrong in edinting product..");
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
}
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;
  // const product = new Product(updatedTitle, updatedPrice, updatedDesc, updatedImageUrl)
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      path: '/admin/add-product',
      pageTitle: 'add-product',
      editing: true,
      hasError: true,
      errorMessage: error.array()[0].msg,
      product: { title: updatedTitle, price: updatedPrice, image: updatedImageUrl, description: updatedDesc, }
    });
  }
  Product.findById(prodId).then((product) => {
    product.title = updatedTitle;
    product.price = updatedPrice;
    if (image) {
      unlinkFile(product.imageUrl)
      product.imageUrl = image.path;

    }
    product.description = updatedDesc;
    return product.save();
  }).then(result => {
    res.redirect("/admin/products")
  })
    .catch(err => {
      console.log("something went wrong in edinting product..");
      console.log(err);

      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);

    })
};

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
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      console.log("something went wrong in getting product..");
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error)
    });

};
exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  if (!prodId) {
    console.log('Delete failed: productId missing');
    return res.redirect('/admin/products');
  }

  Product.findById(prodId)
    .then(product => {
      if (!product) {
        console.log('PRODUCT NOT FOUND ...');
        return res.redirect('/admin/products');
      }

      const imagePath = product.imageUrl;

      return Product.findByIdAndDelete(prodId).then(result => {
        if (!result) {
          console.log('product not found');
          return res.redirect('/admin/products');
        }

        res.status(200).json({ msg: "success" })

        unlinkFile(imagePath)
      });
    })
    .catch(err => {
      res.status(500).json({ msg: "spmething went wrong in deleteing product" })
    });
};   