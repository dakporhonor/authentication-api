const mongoose = require("mongoose");

const dbConnect = async function () {
	await mongoose.connect(process.env.MONGODB_URL, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	});
	console.log(`Connected to db ${process.env.MONGODB_URL}`);
};

module.exports = dbConnect;
