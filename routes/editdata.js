const express = require('express')
const editrouter = express.Router();

const{ChangeImage, RemoveImage} = require('../controler/ChangeData.js')
editrouter.put('/changeImage', ChangeImage);
editrouter.put('/RemoveImage', RemoveImage);

module.exports = {editrouter}