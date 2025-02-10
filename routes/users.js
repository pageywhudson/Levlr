// GET user preferences
router.get('/preferences', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user.preferences);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching preferences' });
    }
});

// UPDATE user preferences
router.put('/preferences', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.preferences = {
            ...user.preferences,
            ...req.body
        };
        await user.save();
        res.json(user.preferences);
    } catch (error) {
        res.status(500).json({ message: 'Error updating preferences' });
    }
}); 