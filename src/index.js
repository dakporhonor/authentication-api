const express = require("express");
require("dotenv").config();
const dbConnect = require("./db/mongoose");

const usersRoute = require("./routes/users");

const app = express();
dbConnect();

app.use(express.json({ extented: false }));

app.get("/", (req, res) => {
	res.json({ message: "Welcome!" });
});

app.use("/users", usersRoute);
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server Started on port ${port}`));
