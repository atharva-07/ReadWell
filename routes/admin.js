const express = require('express');

const router = express.Router();

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/access').isAuth;
const isAdmin = require('../middleware/access').isAdmin;

// GET --> admin/add-series
router.get('/add-series', isAuth, isAdmin, adminController.getAddSeries);

// POST --> admin-add-series
router.post('/add-series', isAuth, isAdmin, adminController.postAddSeries);

// GET --> admin/add-volume
router.get('/add-volume', isAuth, isAdmin, adminController.getAddVolume);

// POST --> admin/add-volume
router.post('/add-volume', isAuth, isAdmin, adminController.postAddVolume);

// GET --> admin/series
router.get('/series', isAuth, isAdmin, adminController.getAdminSeries);

// GET --> admin/series/:seriesName
router.get(
  '/series/:seriesId/:seriesName',
  isAuth,
  isAdmin,
  adminController.getAdminVolumes
);

// GET --> admin/edit-series/:seriesId/:seriesName
router.get(
  '/edit-series/:seriesId/:seriesName',
  isAuth,
  isAdmin,
  adminController.getEditSeries
);

// POST --> admin/edit-series/:seriesName
router.post('/edit-series', isAuth, isAdmin, adminController.postEditSeries);

// GET --> admin/edit-volume/:seriesId/:volumeId/:seriesName/:volumeNumber
router.get(
  '/edit-volume/:seriesId/:volumeId/:seriesName/:volumeNumber',
  isAuth,
  isAdmin,
  adminController.getEditVolume
);

// POST --> admin/edit-volume
router.post('/edit-volume', isAuth, isAdmin, adminController.postEditVolume);

// POST --> admin/delete-series
router.post(
  '/delete-series',
  isAuth,
  isAdmin,
  adminController.postDeleteSeries
);

// POST --> admin/delete-volume
router.post(
  '/delete-volume',
  isAuth,
  isAdmin,
  adminController.postDeleteVolume
);

module.exports = router;
