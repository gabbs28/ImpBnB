const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { Review } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

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


//Returns all the reviews written by the current user.
router.get("/current", requireAuth, async(req, res, next) => {
  const reviews = (await Review.findAll({
    where: {
      ownerId : req.user.id
    }
  })).map(spot => spot.toJSON());

  for(const spot of spots) {

    await addSpotAverageRating(spot, "avgRating"); 
    //awaiting it bc it is an async func
    await addSpotPreviewImage(spot);
  };

  return res.json({Spots: spots});
})

//Get all Reviews by a Spot's id: Returns all the reviews that belong to a spot specified by id.


//Create a Review for a Spot based on the Spot's id: Create and return a new review for a spot specified by id.

//Add an Image to a Review based on the Review's id: Create and return a new image for a review specified by id.

//Edit a Review: Update and return an existing review.

//Delete a Review: Delete an existing review.

module.exports = router;