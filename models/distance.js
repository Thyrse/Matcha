const express = require('express');
const randomLocation = require('random-location');

exports.calcDistanceKm = function (user1,user2) {
    const point_1 = {
        latitude: user1.latitude,
        longitude: user1.longitude
    }
    const point_2 = {
        latitude: user2.latitude,
        longitude: user2.longitude
    }
    return Math.ceil(randomLocation.distance(point_1, point_2)/ 1000)
}