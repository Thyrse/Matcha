const express = require('express');
const connection = require('../config/database.js');
const attraction = require('./attraction.js')
const interests = require('./interests.js')
const distance = require('./distance.js')


setCompatibility = async function(user_id,target_id) {
    connection.query('SELECT u.id, u.gender_id, u.orientation_id, u.latitude, u.longitude, t.* FROM users u JOIN tags t ON u.id = t.user_id WHERE u.id = ? OR u.id = ?', [user_id,target_id], async function(err,records) {
        const compatibility = {
            user_id : user_id,
            target_id: target_id,
            attraction : await attraction.setAttraction(records[0], records[1]),
            interests : await interests.calcInterests(records[0], records[1]),
            distance : await distance.calcDistanceKm(records[0],records[1]),
        }
        await connection.query('SELECT * FROM compatibility WHERE user_id = ? AND target_id = ?',[user_id,target_id], function(err,res) {
            if(!res[0]) {
                connection.query('INSERT INTO compatibility SET ?, viewable = 1', compatibility, function(err) {
                    if(err)
                        throw(err)
                })
            } else {
                connection.query('UPDATE compatibility SET ? WHERE user_id = ? AND target_id = ?',[compatibility, user_id, target_id], function(err) {
                    if(err)
                        throw(err)
                })

            }
        })

        await connection.query('SELECT r.*, b.* FROM reported r, block b WHERE (r.user_reported = ? AND r.user_emit = ?) OR (b.user_blocked = ? AND b.user_emit = ?)', [user_id,target_id,user_id,target_id], function(err,res) {
            if(err)
                throw(err)
            else if (res[0]){
                connection.query('UPDATE compatibility SET viewable = 0 WHERE user_id = ? AND target_id = ?',[user_id, target_id], function(err) {
                    if(err)
                        throw(err)
                })

            }
        })
    });
}


exports.updateCompatibilities = async function(user_id) {
    connection.query('SELECT id FROM users WHERE id <> ? AND valid = 1 AND complete = 1 AND complete_image = 1',[user_id], async function(err,res) {
        for(i=0; i<res.length; i++) {
            await setCompatibility(user_id, res[i].id)
        }
    })
}

