const express = require('express');
const app = express();
const PORT = 3002;

app.use(express.json());
require("./db/mongoConfig");
const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");

app.get('/', (req, res) => {
    console.log('###############');
    res.send('Hello World'); // Send a response to the client
});

app.use(userRoute);
app.use(adminRoute);

app.listen(PORT, () => {
    console.log(`Server is Listening on PORT :: ${PORT}`);
});
