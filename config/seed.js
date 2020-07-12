const express = require('express');
const Fakerator = require('fakerator');
const fakerator = Fakerator('fr-FR');
const randomLocation = require('random-location')
const connection = require('./database.js')

exports.generateRandomUsers = async function() {
    await connection.query('SELECT id FROM users', async function(err, res) {
        if (err)
            console.log(err)
        else {
            if(res.length > 500) {
                console.log('Database already seeded')
            } else {
                for(let i = 1; i < 501; i++) {
                    const query = 'INSERT INTO users SET username = ?, password = ?, email = ?, first_name = ?, last_name = ?, gender_id = ?, orientation_id = ?, popularity = ?, bio = ?, birthday = ?, latitude = ?, longitude = ?, valid = 1, complete = 1, complete_image = 1';
                    
                    const nameM = ['Terry','Paul','Jeremy','Alexandre','Mathieu','Abel','Valentin','Nicolas','Louis','Arthur','Noa','Raphaël','Ethan','Hugo','Thomas','Jules','Anthony','Benjamin','Kylian','Dimitri','Gabriel','Simon','Malo','Matéo','Sohan','Ayden','Lucas','Lenny','Liam','Axel']
                    const nameF = ['Gwen','Justine','Jade','Lola','Camille','Judith','Louise','Clara','Mathilde','Lou','Chloé','Laura','Laure','Elisa','Sophie','Lina','Lucie','Sarah','Anna','Iris','Louna','Alya','Lya','Rose','Valentine','Alice','Léa','Anaïs','Lise','Yasmine']
                    
                    const gen = fakerator.random.number(1,2);
                    const fname = gen == 1 ? fakerator.random.arrayElement(nameM) : fakerator.random.arrayElement(nameF)
                    const lname = fakerator.names.lastName();
                    const uname = fakerator.internet.userName(fname,lname);
                    const pwd = "$2b$10$kv/iQGTI3vAmF1/M1lwLyuMR9Bp0piJ0l5T7FxVoZJE1XoO09NFLm";
                    const mail = fakerator.internet.email(fname,lname);
                    const or = fakerator.random.number(1,3);                                      //orientation_id
                    const pop = fakerator.random.number(50,100);                                      //popularity
                    const bio = fakerator.lorem.sentence();                                        //bio
                    const dob = fakerator.random.number(18,60);                   //birthday
                    const P = {
                        latitude: 48.896730,
                        longitude: 2.318351
                        }
                    const R = 100000
                    const geo = randomLocation.randomCirclePoint(P, R)

                    const vegan = fakerator.random.number(0,1);
                    const fitness = fakerator.random.number(0,1);
                    const netflix = fakerator.random.number(0,1);
                    const party = fakerator.random.number(0,1);
                    const nature = fakerator.random.number(0,1);

                    const pic = gen == 1 ? fakerator.random.number(1,30) : fakerator.random.number(31,60);

                    await connection.query(query,[uname,pwd,mail,fname,lname,gen,or,pop,bio,dob,geo.latitude,geo.longitude], async function(err, new_user) {
                        await connection.query('INSERT INTO tags SET user_id = ?, vegan = ?, fitness = ?, netflix = ?, party = ?, nature = ?',[new_user.insertId,vegan,fitness,netflix,party,nature], function(err) {
                            if (err)
                                console.log(err)
                            })
                    });

                    await connection.query('INSERT INTO image SET user_id = ?, image_name = ?, main_image = 1', [uname,pic], function(err) {
                        if (err)
                            console.log(err);
                    })
                }
            }
        }
    })
}