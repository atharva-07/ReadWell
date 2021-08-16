const Series = require('../models/series').series;
const Volume = require('../models/series').volume;

exports.getAddSeries = (req, res, next) => {
  res.render('admin/add-edit-series', {
    docTitle: 'Add Series',
    path: '/admin/add-series',
    editing: false
  });
};

exports.postAddSeries = (req, res, next) => {
  const title = req.body.title;
  const author = req.body.author;
  const cover = req.body.cover;
  const megaCover = req.body.megaCover;
  const description = req.body.description;
  const category = req.body.category;
  const genres = req.body.genres;
  const series = new Series({
    title,
    author,
    cover,
    megaCover,
    description,
    category,
    genres
  });
  series
    .save()
    .then((result) => {
      console.log('Created New Series!');
      res.redirect('/');
    })
    .catch((err) => {
      console.log('Adding Series Failed!', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getAddVolume = (req, res, next) => {
  Series.find({}, { _id: 0, title: 1 }, (err, result) => {
    res.render('admin/add-edit-volume', {
      docTitle: 'Add Volume',
      path: '/admin/add-volume',
      series: result,
      editing: false
    });
  });
};

exports.postAddVolume = (req, res, next) => {
  const seriesName = req.body.seriesName;
  const number = req.body.number;
  const pages = req.body.pages;
  const price = req.body.price;
  const isbn = req.body.isbn;
  const cover = req.body.cover;
  const description = req.body.description;
  let chaptersCovered = req.body.chaptersCovered;
  chaptersCovered = chaptersCovered.split('<->');
  const volume = new Volume({
    number,
    pages,
    price,
    isbn,
    cover,
    description,
    chaptersCovered
  });
  Series.findOne({ title: seriesName }).then((result) => {
    result.volumes.push(volume);
    result
      .save()
      .then((result) => {
        console.log('Created New Volume!');
        res.redirect('/');
      })
      .catch((err) => {
        console.log('Adding Volume Failed!', err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getAdminSeries = (req, res, next) => {
  Series.find()
    .then((products) => {
      res.render('admin/series', {
        docTitle: 'Admin | Products',
        path: '/admin/series',
        series: products
      });
    })
    .catch((err) => {
      console.log('Could not fetch admin series products', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getAdminVolumes = (req, res, next) => {
  const seriesId = req.params.seriesId;
  Series.findById(seriesId)
    .then((product) => {
      res.render('admin/volumes', {
        docTitle: `Admin | ${product.title}`,
        path: '/admin/series',
        series: product
      });
    })
    .catch((err) => {
      console.log('Could not fetch admin volume products', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditSeries = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const seriesId = req.params.seriesId;
  Series.findById(seriesId)
    .then((products) => {
      res.render('admin/add-edit-series', {
        docTitle: 'Edit Series',
        series: products,
        editing: editMode
      });
    })
    .catch((err) => {
      console.log('Could not edit series', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditSeries = (req, res, next) => {
  const seriedId = req.body.seriesId;
  const updatedTitle = req.body.title;
  const updatedAuthor = req.body.author;
  const updatedCover = req.body.cover;
  const updatedMegaCover = req.body.megaCover;
  const updatedDescription = req.body.description;
  const updatedCategory = req.body.category;
  const updatedGenres = req.body.genres;
  Series.findById(seriedId)
    .then((series) => {
      series.title = updatedTitle;
      series.author = updatedAuthor;
      series.cover = updatedCover;
      series.megaCover = updatedMegaCover;
      series.description = updatedDescription;
      series.category = updatedCategory;
      series.genres = updatedGenres;
      return series.save().then((result) => {
        console.log('UPDATED SERIES!');
        res.redirect('/admin/series');
      });
    })
    .catch((err) => {
      console.log('Could not update series', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditVolume = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const seriesId = req.params.seriesId;
  const volumeId = req.params.volumeId;
  Series.findById(seriesId)
    .then((product) => {
      const volume = product.volumes.id(volumeId);
      res.render('admin/add-edit-volume', {
        docTitle: 'Edit Volume',
        series: product,
        volume: volume,
        editing: editMode
      });
    })
    .catch((err) => {
      console.log('Could not edit volume', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditVolume = (req, res, next) => {
  const seriesId = req.body.seriesId;
  const volumeId = req.body.volumeId;
  const updatedNumber = req.body.number;
  const updatedPages = req.body.pages;
  const updatedPrice = req.body.price;
  const updatedIsbn = req.body.isbn;
  const updatedCover = req.body.cover;
  const updatedDescription = req.body.description;
  let updatedChaptersCovered = req.body.chaptersCovered;
  updatedChaptersCovered = updatedChaptersCovered.split('<->');
  Series.findById(seriesId)
    .then((series) => {
      const volume = series.volumes.id(volumeId);
      volume.number = updatedNumber;
      volume.pages = updatedPages;
      volume.price = updatedPrice;
      volume.isbn = updatedIsbn;
      volume.cover = updatedCover;
      volume.description = updatedDescription;
      volume.chaptersCovered = updatedChaptersCovered;
      return series.save().then((result) => {
        console.log('UPDATED VOLUME!');
        res.redirect('/admin/series');
      });
    })
    .catch((err) => {
      console.log('Could not update volume', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteSeries = (req, res, next) => {
  const seriesId = req.body.seriesId;
  Series.deleteOne({ _id: seriesId })
    .then((result) => {
      console.log('DELETED SERIES!');
      res.redirect('/admin/series');
    })
    .catch((err) => {
      console.log('Could not delete series', err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteVolume = (req, res, next) => {
  const seriesId = req.body.seriesId;
  const volumeId = req.body.volumeId;
  Series.findById(seriesId).then((series) => {
    series.volumes.id(volumeId).remove();
    return series
      .save()
      .then((result) => {
        console.log('DELETED VOLUME!');
        res.redirect('/admin/series');
      })
      .catch((err) => {
        console.log('Could not delete volume', err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};
