const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		default: "User",
	},

	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
		lowercase: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error("Email is invalid!");
			}
		},
	},
	tokens: [
		{
			token: {
				type: String,
				required: true,
			},
		},
	],
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: [7, "Password too short"],
		validate(value) {
			if (validator.contains(value, "password")) {
				throw new Error("Password must not contain 'password'", value);
			}
		},
	},
});

userSchema.methods.generateAccessToken = async function () {
	try {
		const user = this;
		const payload = {
			_id: user._id.toString(),
		};
		const token = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET);

		user.tokens = user.tokens.concat({ token });
		await user.save();
		return token;
	} catch (error) {
		throw new Error(error.message);
	}
};
userSchema.methods.toJSON = function () {
	try {
		const user = this;
		const userObject = user.toObject();
		delete userObject.password;
		delete userObject.tokens;
		return userObject;
	} catch (error) {
		return error;
	}
};
userSchema.statics.loginByCredentials = async function (email, password) {
	try {
		const user = await User.findOne({ email: email });

		if (!user) {
			throw new Error("Unable to login");
		}
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			throw new Error("Unable to login");
		}

		return user;
	} catch (error) {
		console.log(error.message);
		throw new Error(error.message);
	}
};

userSchema.pre("save", async function (next) {
	const user = this;
	if (user.isModified("password")) {
		user.password = await bcrypt.hash(user.password, 10);
	}
	next();
});
const User = mongoose.model("User", userSchema);
module.exports = User;
