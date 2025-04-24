const express = require('express');
const router = express.Router();
const WhrData = require('../models/WhrData');

// GET main WHR page
router.get('/', async (req, res) => {
  try {
    res.render('pages/whr', { input: {}, whr: null, whrStatus: null, error: null });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// POST calculate WHR
router.post('/calculate-whr', async (req, res) => {
  try {
    const { waist, hip } = req.body;
    if (!waist || !hip) {
      return res.render('pages/whr', {
        input: req.body,
        whr: null,
        whrStatus: null,
        error: 'Ukuran pinggang dan pinggul harus diisi',
      });
    }
    const waistNum = parseFloat(waist);
    const hipNum = parseFloat(hip);
    if (isNaN(waistNum) || isNaN(hipNum)) {
      return res.render('pages/whr', {
        input: req.body,
        whr: null,
        whrStatus: null,
        error: 'Ukuran pinggang dan pinggul harus diisi',
      });
    }
    let whr = waistNum / hipNum;
    whr = parseFloat(whr.toFixed(2));
    let whrStatus = '';
    if (whr < 0.85) {
      whrStatus = 'Risiko Rendah';
    } else if (whr >= 0.85 && whr < 0.9) {
      whrStatus = 'Risiko Sedang';
    } else {
      whrStatus = 'Risiko Tinggi';
    }
    const newWhrData = new WhrData({
      waist: waistNum,
      hip: hipNum,
      whr,
      whrStatus,
      userId: req.user ? req.user._id : null,
    });
    await newWhrData.save();

    res.render('pages/whr', {
      input: req.body,
      whr,
      whrStatus,
      error: null,
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// GET edit
router.get('/edit/:id', async (req, res) => {
  try {
    const record = await WhrData.findById(req.params.id);
    if (!record) {
      return res.status(404).send('Record not found');
    }
    const recordObj = record.toObject();
    res.render('pages/edit', { data: recordObj, type: 'whr' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// POST update WHR
router.post('/edit/:id', async (req, res) => {
  try {
    const { waist, hip } = req.body;
    if (!waist || !hip) {
      return res.render('pages/edit', {
        data: req.body,
        type: 'whr',
        error: 'Ukuran pinggang dan pinggul harus diisi',
      });
    }
    const waistNum = parseFloat(waist);
    const hipNum = parseFloat(hip);
    if (isNaN(waistNum) || isNaN(hipNum)) {
      return res.render('pages/edit', {
        data: req.body,
        type: 'whr',
        error: 'Ukuran pinggang dan pinggul harus diisi',
      });
    }
    let whr = waistNum / hipNum;
    whr = parseFloat(whr.toFixed(2));
    let whrStatus = '';
    if (whr < 0.85) {
      whrStatus = 'Risiko Rendah';
    } else if (whr >= 0.85 && whr < 0.9) {
      whrStatus = 'Risiko Sedang';
    } else {
      whrStatus = 'Risiko Tinggi';
    }
    const updatedRecord = await WhrData.findByIdAndUpdate(
      req.params.id,
      { waist: waistNum, hip: hipNum, whr, whrStatus },
      { new: true }
    );
    res.redirect('/whr');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
