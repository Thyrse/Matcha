const express = require('express');

exports.setAttraction = function (user1,user2) {
    let attraction = 0;
    if (user1.gender_id == 1 && user1.orientation_id == 1) {
        // Man(1) - Straight(1) - thus looking for Women(2) either Straight(1) or Bisexual(3)
        if (user2.gender_id == 2 && (user2.orientation_id == 1 || user2.orientation_id == 3))
            attraction = 1;

    } else if (user1.gender_id == 1 && user1.orientation_id == 2) {
        // Man(1) - Gay(2) - thus looking for Men(1) either Gay(2) or Bisexual(3)
        if(user2.gender_id == 1 && (user2.orientation_id == 2 || user2.orientation_id == 3))
            attraction = 1;

    } else if (user1.gender_id == 1 && user1.orientation_id == 3) {
        // Man - Bisexual thus looking for Men(1) either Gay(2) or Bisexual(3) and Women(2) either Straight(1) or Bisexual(3)
        if (user2.gender_id == 1 && (user2.orientation_id == 2 || user2.orientation_id == 3))
            attraction = 1;
        else if (user2.gender_id == 2 && (user2.orientation_id == 1 || user2.orientation_id == 3))
            attraction = 1;

    } else if (user1.gender_id == 2 && user1.orientation_id == 1) {
        // Woman - Straight - thus looking for Men(1) either Straight(1) or Bisexual(3)
        if(user2.gender_id == 1 && (user2.orientation_id == 1 || user2.orientation_id == 3))
            attraction = 1;
        
    } else if (user1.gender_id == 2 && user1.orientation_id == 2) {
        // Woman - Gay - thus looking for Women(2) either Gay(2) or Bisexual(3)
        if(user2.gender_id == 2 && (user2.orientation_id == 2 || user2.orientation_id == 3))
            attraction = 1;
        
    } else if (user1.gender_id == 2 && user1.orientation_id == 3) {
        // Woman - Bisexual - thus looking for Women(2) either Gay(2) or Bisexual(3) and Men(1) either Straight(1) or Bisexual(3)
        if (user2.gender_id == 2 && (user2.orientation_id == 2 || user2.orientation_id == 3))
            attraction = 1;
        else if (user2.gender_id == 1 && (user2.orientation_id == 1 || user2.orientation_id == 3))
            attraction = 1;
            
    } 
    return attraction;
}