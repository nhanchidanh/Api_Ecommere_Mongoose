const express = require("express");
const dbConnect = require("./config/db_connect");
const initRoutes = require("./routes");
const cookieParser = require("cookie-parser");

require("dotenv").config();

// create app, port
const app = express();

// Can read/write cookie
app.use(cookieParser());
const port = process.env.PORT || 8888;

app.use(express.json()); //read data type json
app.use(express.urlencoded({ extended: true })); //read data type array object

// connect DB
dbConnect();
// Routes
initRoutes(app);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
