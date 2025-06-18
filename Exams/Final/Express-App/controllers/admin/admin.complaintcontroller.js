let express = require('express');
let router = express.Router();
let Complaint = require('../../models/Complaint.model');

router.get('/admin/complaints', async (req, res) => {
    if (!req.session.user || req.session.user.isAdmin !== 'admin') {
        return res.redirect('/');
    }

    try {
        const complaints = await Complaint.find()
            .sort({ createdAt: -1 });

        res.render('admin/complaints', {
            complaints,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.redirect('/admin');
    }
});

// POST update complaint status
router.post('/admin/complaints/:id/update-status', async (req, res) => {
    if (!req.session.user || req.session.user.isAdmin !== 'admin') {
        return res.redirect('/');
    }

    try {
        const { status } = req.body;
        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!complaint) {
            return res.redirect('/admin/complaints');
        }

        res.redirect('/admin/complaints');
    } catch (error) {
        console.error('Error updating complaint status:', error);
        res.redirect('/admin/complaints');
    }
});

module.exports = router;