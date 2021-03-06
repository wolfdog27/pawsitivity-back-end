const router = require("express").Router();
const shelterAPI = require("../utils/shelterAPI/API.js")
const db = require("../models");


//BASE URL FOR AL ROUTES ON THIS PAGE: /api/animals

router.get("/", (req, res) => {
    db.Animal.findAll({})
        .then(animalData => {
            res.json(animalData)
        })
        .catch(err => {
            console.log(err);
            res.status(500).end();
        })
});

//get animal's info by id
router.get("/shelterAnimal/:id", (req, res) => {
    if (!req.session.shelter) {
        res.status(403).end();
    } else {
        db.Animal.findOne({
            where: {
                id: req.params.id
            }
        })
            .then(dbAnimal => {
                res.json(dbAnimal)
            })
            .catch(err => {
                console.log(err);
                res.status(500).end()
            })
    }
})

router.get("/all/", (req, res) => {
    if (!req.session.shelter) {
        res.status(403).end();
    } else {
        db.Animal.findAll({
            where: {
                AnimalShelterId: req.session.shelter.ShelterId
            }
        })
            .then(animalData => {
                res.json(animalData)
            })
            .catch(err => {
                console.log(err);
                res.status(500).end();
            })
    }
});

router.get(`/search/`, (req, res) => {
    if (!req.session.user) {
        res.status(403).end();
    } else {
        db.Animal.findAll({
            where: {
                // state: req.session.user.state,
                type: req.session.user.whichSpecies,
                likesCats: req.session.user.hasCats,
                likesDogs: req.session.user.hasDogs,
                likesKids: req.session.user.hasKids
            }

        }).then(dbAnimals => {
            res.json(dbAnimals)
        })
            .catch(err => {
                console.log(err);
                res.status(500).end();
            })
    }
})

router.get(`/searchWithState/`, (req, res) => {
    if (!req.session.user) {
        res.status(403).end();
    } else {
        db.AnimalShelter.findAll({
            where: {
                state: req.session.user.state
            },
            include: [
                {
                    model: db.Animal,
                }
            ]
        })
            .then(dbAnimalShelter => {
                db.Animal.findAll({
                    where: {
                        AnimalShelterId: dbAnimalShelter.ShelterId,
                        type: req.session.user.whichSpecies,
                        likesCats: req.session.user.hasCats,
                        likesDogs: req.session.user.hasDogs,
                        likesKids: req.session.user.hasKids
                    }
                }).then(dbAnimals => {
                    res.json(dbAnimals)
                })
                    .catch(err => {
                        console.log(err);
                        res.status(500).end();
                    })
            })
    }
})

router.post("/animal", (req, res) => {
    if (!req.session.shelter) {
        res.status(403).end();
    } else {
        db.Animal.create({
            name: req.body.name,
            type: req.body.type,
            location: req.body.location,
            imageSrc: req.body.imageSrc,
            breed: req.body.breed,
            secondaryBreed: req.body.secondaryBreed,
            age: req.body.age,
            sex: req.body.sex,
            size: req.body.size,
            bio: req.body.bio,
            likesCats: req.body.likesCats,
            likesDogs: req.body.likesDogs,
            likesKids: req.body.likesKids,
            isShelterAnimal: true,
            AnimalShelterId: req.session.shelter.ShelterId
        })
            .then(animalData => {
                res.json(animalData)
            })
            .catch(err => {
                console.log(err);
                res.status(500).end();
            })
    }
})

router.delete('/delete/:id', (req, res) => {
    if (!req.session.shelter) {
        res.status(403).end();
    } else {
        db.Animal.destroy({
            where: {
                id: req.params.id
            }
        })
            .then(deleted => {
                res.json(deleted)
            })
            .catch(err => {
                console.log(err);
                res.status(500).end()
            })
    }
})

router.put("/animal/:id", (req, res) => {
    if (!req.session.shelter) {
        res.status(403).end();
    } else {
        db.Animal.update({
            name: req.body.name,
            type: req.body.type,
            location: req.body.location,
            imageSrc: req.body.imageSrc,
            breed: req.body.breed,
            secondaryBreed: req.body.secondaryBreed,
            age: req.body.age,
            sex: req.body.sex,
            size: req.body.size,
            bio: req.body.bio,
            likesCats: req.body.likesCats,
            likesDogs: req.body.likesDogs,
            likesKids: req.body.likesKids,
        },
            {
                where: {
                    id: req.params.AnimalId
                }
            })
            .then(animalData => {
                res.json(animalData)
            })
            .catch(err => {
                console.log(err);
                res.status(500).end();
            })
    }
})

//LOOK HERE IF MATCHES BETWEEN USER AND SHELTER ANIMALS ARE NOT WORKING
router.post('/shelterMatch/:id', (req, res) => {
    if (!req.session.user) {
        res.status(403).end();
    } else {
        db.AnimalMatch.create({
            isLiked: req.body.isLiked,
            UserId: req.session.user.UserId,
            AnimalShelterId: req.body.AnimalShelterId,
            AnimalId: req.params.id
        }).then(animalData => {
            db.Animal.update({
                AnimalMatchId: req.body.AnimalMatchId
            },
                {
                    where: {
                        id: req.params.id
                    }
                })
                .then(animalMatch => {
                    db.User.update({
                        AnimalMatchId: animalMatch.AnimalMatchId
                    },
                        {
                            where: {
                                id: req.session.user.UserId
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            res.status(500).end();
                        })
                })
        })
    }
})

module.exports = router;