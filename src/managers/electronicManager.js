const e = require("express")
const Electronic = require("../models/Electronic")
const User = require('../models/User')


exports.create = (userId, electronicData) => {
    const createdElectronic = Electronic.create({
        owner: userId,
        ...electronicData
    })

    User.findByIdAndUpdate(userId, {$push: {createdElectronics: createdElectronic._id}})
    return createdElectronic
}


exports.getAll = () => Electronic.find()
exports.getOne = (electronicId) => Electronic.findById(electronicId)
exports.getOneWithDetails = (electronicId) => this.getOne(electronicId).populate('owner')

exports.edit = (electronicId, electronicData) => Electronic.findByIdAndUpdate(electronicId, electronicData, { runValidators: true })
exports.delete = (electronicId) => Electronic.findByIdAndDelete(electronicId)