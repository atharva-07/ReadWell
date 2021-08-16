const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  contact: {
    type: Number,
    default: null
  },
  gender: {
    type: String,
    default: ''
  },
  dob: {
    type: Date,
    default: null
  },
  admin: {
    type: Boolean,
    default: false
  },
  address: {
    type: String,
    default: ''
  },
  cart: {
    items: [
      {
        seriesId: {
          type: Schema.Types.ObjectId,
          required: true
        },
        volumeId: {
          type: Schema.Types.ObjectId,
          required: true
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ],
    totalPrice: {
      type: Number,
      default: 0,
      required: true
    }
  },
  resetToken: String,
  resetTokenExpiration: Date
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.volumeId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const addedPrice = product.price;
  let newTotalPrice = 0;
  if (this.cart.totalPrice === 0) {
    newTotalPrice = +addedPrice;
  } else {
    newTotalPrice = this.cart.totalPrice + +addedPrice;
  }

  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      seriesId: product.parent()._id,
      volumeId: product._id,
      quantity: newQuantity
    });
  }
  const updatedCart = {
    items: updatedCartItems,
    totalPrice: +newTotalPrice
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (
  productId,
  productPrice,
  productQty
) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.volumeId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  this.cart.totalPrice -= productPrice * productQty;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [], totalPrice: 0 };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
