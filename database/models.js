const mongoose = require('mongoose');

const counterModel = mongoose.model('counter', mongoose.Schema({
    name: { type: String, required: true },
    count: { type: Number, default: 0 }
}));

const orderModel = mongoose.model('Order', mongoose.Schema({
    orderId: { type: Number, default: -1 },
    status: { type: String, default: 'Open' },
    channelId: { type: String, default: '' },
    messageId: { type: String, default: '' },
    buyerId: { type: String, default: '' },
    sellerId: { type: String, default: '' },
    offerLevel: { type: Number, default: -1 },
    offerAmount: { type: Number, default: -1 },
    requestLevel: { type: Number, default: -1 },
    requestAmount: { type: Number, default: -1 },
    comment: { type: String, default: '' },
    createdTimestamp: { type: Number, default: -1 },
    editedTimestamp: { type: Number, default: -1 },
    acceptedTimestamp: { type: Number, default: -1 },
    completedTimestamp: { type: Number, default: -1 },
    reminded: { type: Boolean, default: false }
}));

module.exports = {
    Counter: counterModel,
    Order: orderModel
}