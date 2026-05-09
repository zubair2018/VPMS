const express = require('express');
const {
  createVisitor,
  getVisitors,
  publicRegisterVisitor,
  getVisitorPassByEmail
} = require('../controllers/visitorController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/public/pass', getVisitorPassByEmail);
router.post('/public/register', publicRegisterVisitor);

router
  .route('/')
  .get(protect, getVisitors)
  .post(
    protect,
    authorize('admin', 'security', 'employee'),
    upload.fields([
      { name: 'photo', maxCount: 1 },
      { name: 'idProof', maxCount: 1 }
    ]),
    createVisitor
  );

module.exports = router;