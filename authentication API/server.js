const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./auth");

const app = express();
app.use(bodyParser.json());

// Gunakan rute autentikasi
app.use("/auth", authRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
