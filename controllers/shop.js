const Series = require('../models/series').series;
const Order = require('../models/order');
const async = require('async');

exports.getHome = (req, res, next) => {
  Series.find()
    .then((products) => {
      res.render('shop/home', {
        docTitle: 'ReadWell | Home',
        path: '/home',
        series: products
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getShop = (req, res, next) => {
  Series.find()
    .then((products) => {
      res.render('shop/shop', {
        docTitle: 'Shop',
        path: '/shop',
        series: products
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getSeries = (req, res, next) => {
  const seriesId = req.params.seriesId;
  Series.findById(seriesId)
    .then((product) => {
      res.render('shop/series-desc', {
        docTitle: product.title,
        path: '/shop',
        series: product
      });
    })
    .catch((err) => {
      console.log('Could not fetch series description', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getVolume = (req, res, next) => {
  const seriesId = req.params.seriesId;
  const volumeId = req.params.volumeId;
  Series.findById(seriesId)
    .then((product) => {
      const volume = product.volumes.id(volumeId);
      res.render('shop/volume-desc', {
        docTitle: `Volume ${volume.number} | ${product.title}`,
        path: '/shop',
        series: product,
        volume: volume
      });
    })
    .catch((err) => {
      console.log('Could not fetch volume description', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  const products = req.user.cart.items;
  const volumes = [];
  async.eachSeries(
    products,
    function (product, callback) {
      const seriesId = product.seriesId;
      const volumeId = product.volumeId;
      Series.findById(seriesId).then((series) => {
        const volume = series.volumes.id(volumeId);
        const data = {
          series: volume.parent(),
          volume: volume,
          quantity: product.quantity
        };
        if (data === '') {
          callback('Failed');
        } else {
          volumes.push(data);
          callback(null);
        }
      });
    },
    function (err) {
      if (err) {
        console.log('Could not retrieve cart items');
      } else {
        res.render('shop/cart', {
          docTitle: 'Your Cart',
          path: '/cart',
          volumes: volumes,
          totalPrice: req.user.cart.totalPrice
        });
      }
    }
  );
};

exports.postCart = (req, res, next) => {
  const volumeId = req.body.volumeId;
  const seriesName = req.body.seriesName;
  Series.findOne({ title: seriesName })
    .then((product) => {
      const volume = product.volumes.id(volumeId);
      return req.user.addToCart(volume);
    })
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((err) => {
      console.log('Could not add the volume to cart', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteItem = (req, res, next) => {
  const volumeId = req.body.volumeId;
  const volumePrice = req.body.volumePrice;
  const volumeQty = req.body.volumeQty;
  req.user
    .removeFromCart(volumeId, volumePrice, volumeQty)
    .then((result) => {
      console.log('REMOVED ITEM FROM CART!');
      res.redirect('/cart');
    })
    .catch((err) => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = async (req, res, next) => {
  const userOrders = [];
  Order.find({ 'user.userId': req.user._id }).then((orders) => {
    async.eachSeries(
      orders,
      function (order, callback) {
        const productPromise = order.products.map((p) => {
          const seriesId = p.product.seriesId;
          const volumeId = p.product.volumeId;
          return Series.findById(seriesId).then((series) => {
            const volume = series.volumes.id(volumeId);
            return {
              series: volume.parent(),
              volume: volume,
              quantity: p.quantity
            };
          });
        });
        Promise.all(productPromise).then(function (products) {
          if (products.length !== 0) {
            const data = {
              productData: products,
              orderData: {
                id: order.id,
                date: order.date,
                totalPrice: order.totalPrice.toFixed(2)
              }
            };
            userOrders.push(data);
            callback(null);
          } else {
            callback('Failed');
          }
        });
      },
      function (err) {
        if (err) {
          console.log('Could not retrieve orders');
        } else {
          res.render('shop/orders', {
            docTitle: 'My Orders',
            path: '/orders',
            orders: userOrders,
            user: req.user
          });
        }
      }
    );
  });
};

exports.postOrder = (req, res, next) => {
  if (req.user.address === '') {
    return res.send(
      'Please add your address and other information from your profile first.'
    );
  }
  const user = req.user;
  const products = user.cart.items.map((p) => {
    return { quantity: p.quantity, product: { ...p } };
  });
  const order = new Order({
    user: {
      email: user.email,
      userId: user._id
    },
    products: products,
    totalPrice: user.cart.totalPrice,
    date: Date.now()
  });
  order
    .save()
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      console.log('SUCCESSFULLY PLACED ORDER!');
      res.redirect('/orders');
    })
    .catch((err) => {
      console.log('Could not store the order', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
