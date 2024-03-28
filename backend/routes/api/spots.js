// backend/routes/api/users.js
const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { Spot, Review } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const validateSpot = [
    check('address')
      .exists({ checkFalsy: true })
      .withMessage('Street address is required'),
    check('city')
      .exists({ checkFalsy: true })
      .withMessage('City is required'),
    check('state')
      .exists({ checkFalsy: true })
      .withMessage('State is required'),
    check('country')
      .exists({ checkFalsy: true })
      .withMessage('Country is required'),
    check('lat')
      .exists({ checkFalsy: true })
      .isDecimal()
      .withMessage('Latitude is not valid'),
    check('lng')
      .exists({ checkFalsy: true })
      .isDecimal()
      .withMessage('Longitude is not valid'),
    check('name')
      .exists({ checkFalsy: true })
      .isLength({ min: 1, max: 49 })
      .withMessage('Name must be less than 50 characters'),
    check('description')
      .exists({ checkFalsy: true })
      .withMessage('Description is required'),
    //does this need to approve decimals?
    check('price')
      .exists({ checkFalsy: true })
      .isInt()
      .withMessage('Price per day is required'),
   
    handleValidationErrors
];

const validateReview = [
  check('review')
    .exists({ checkFalsy: true })
    .withMessage('Review text is required'),
  check('stars')
    .exists({ checkFalsy: true })
    .isInt()
    .isLength({min:1, max:5})
    .withMessage('Stars must be an integer from 1 to 5'),
 
  handleValidationErrors
];

//routes go here

//Get all Spots
router.get("/", async(req, res, next) => {

  const getAllSpots= await Spot.findAll()

    getAllSpots.forEach(async(spot) => {
      const image = await SpotImage.findOne({
        where: {
          spotId: spot.id 
          
        }
      })

      spot.previewImage = image.url
    })

  return res.json({Spots: getAllSpots});
});

// Get all Spots owned by the Current User

//get details of spot from an id

//create a spot
router.post("/", validateSpot, async(req, res, next) =>{
  return res.json(req.body);
})

//Add an Image to a Spot based on the Spot's id

//Edit a Spot
router.put("/:spotId", validateSpot, async(req, res, next) =>{
  return res.json(req.body);
})

//Delete a Spot

//Create a Review for a Spot based on the Spot's id

router.post("/:spotId/reviews", requireAuth, validateReview, async (req, res, next) => {
  try {
    console.log(req.params)
    const newReview = await Review.create({
      userId: req.user.id,
      spotId: req.params.spotId,
      review: req.body.review,
      stars: req.body.stars


    });

    res.status(201).json(newReview)

  } catch(err) {
    console.log(err)
    res.status(404).json({
      message: "Spot couldn't be found"
    })
  }
})


module.exports = router;