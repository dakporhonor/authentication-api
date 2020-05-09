const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middlewares/auth");
router.post("/register", async (req, res) => {
	try {
		const user = new User(req.body);

		await user.save();
		const token = await user.generateAccessToken();

		res.status(201).json({ token });
	} catch (error) {
		res.status(400).send(error);
	}
});

router.post("/login", async (req, res) => {
	try {
		const user = await User.loginByCredentials(req.body.email, req.body.password);
		const token = await user.generateAccessToken();
		res.json({ token });
	} catch (error) {
		res.status(400).send(error.message);
	}
});

router.post("/users/logout", auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter((token) => {
			return token.token != req.token;
		});

		await req.user.save();
		res.send("Logged Out!");
	} catch (error) {
		res.status(500).send("Unable to log out. Try again!");
	}
});

router.patch("/users/me", auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ["name", "email", "password"];
	const isValidOperation = updates.every((update) =>
		allowedUpdates.includes(update)
	);

	if (!isValidOperation) {
		return res.status(400).send("Updates not allowed");
	}

	try {
		updates.forEach((update) => (req.user[update] = req.body[update]));

		await req.user.save();

		res.status(200).send(req.token);
	} catch (error) {
		res.status(400).send(error);
	}
});
module.exports = router;
