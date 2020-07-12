const express = require('express');

exports.calcInterests = function (user1,user2) {
    let i = 0;
    if (user1.vegan == user2.vegan)
        i++;
    if (user1.fitness == user2.fitness)
        i++;
    if (user1.netflix == user2.netflix)
        i++;
    if (user1.party == user2.party)
        i++;
    if (user1.nature == user2.nature)
        i++;
    return i;
}