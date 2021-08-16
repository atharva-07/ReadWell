const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const volumeSchema = new Schema({
  number: {
    type: Number,
    required: true
  },
  pages: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  isbn: {
    type: String,
    required: true
  },
  cover: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  chaptersCovered: {
    type: Array,
    required: true
  }
});

const seriesSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  cover: {
    type: String,
    required: true
  },
  megaCover: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  genres: [
    {
      type: String,
      required: true
    }
  ],
  volumes: [volumeSchema]
});

const mainSchema = {
  series: mongoose.model('Series', seriesSchema),
  volume: mongoose.model('Volume', volumeSchema)
};

module.exports = mainSchema;
