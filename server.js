const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
app.use(express.static(__dirname + '/src'));
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/src/index.html'));
});

app.listen(port, () => console.log(`Listening on port ${port}!`));