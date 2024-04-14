const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { User, Spot, Review, ReviewImage } = require('../../db/models');

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
router.get("/current", requireAuth, async(req, res, _next) => {
  const reviews = (await Review.findAll({
    where: {
      userId : req.user.id
    },
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName']
      },
      {
        model: Spot,
        attributes: {
          exclude: ['description', 'createdAt', 'updatedAt']
        }
      },
      {
        model: ReviewImage,
        attributes: ['id', 'url']
      }
    ]
  }));

  return res.json({Reviews: reviews});
})

//Get all Reviews by a Spot's id: Returns all the reviews that belong to a spot specified by id.
//See spots route

//Create a Review for a Spot based on the Spot's id: Create and return a new review for a spot specified by id.
//See spots route

//Add an Image to a Review based on the Review's id: Create and return a new image for a review specified by id.
router.post(':reviewId/images', requireAuth, async(req, res, _next) => {
  //Extract id
  const spotId = parseInt(req.params.spotId);

  //Look up the review to add the image to (filter out spots not owned by the user)
  const review = await Review.findByPk(spotId, {
    where: {
      ownerId: req.body.id
    }
  });

  //If no spot is found return an error message
  if (!review) {
    return res.status(404).json({message: "Review couldn't be found"});
  }

  //Get count of review images
  const count = ReviewImage.count({
    where: {
      spotId: spotId
    }
  });

  //Can't have more than 10 images
  if (count >= 10) {
    return res.status(403).json({message: "Maximum number of images for this resource was reached"});
  }

  //Add the image to the spot
  const image = await review.addReviewImage(req.body)

  //Return the newly created image
  return res.status(201).json(image);
});

//Edit a Review: Update and return an existing review.
router.put("/:reviewId", requireAuth, validateReview, async(req, res, _next) => {
  //Look up the review to be edited (filter out reviews not owned by the user)
  const review = await Spot.findByPk(parseInt(req.params.reviewId), {
    where: {
      ownerId: req.body.id
    }
  });

  //If no review is found return an error message
  if (!review) {
    return res.status(404).json({message: "Review couldn't be found"});
  }

  //Make sure the review will remain owned by the original user
  req.body.ownerId = req.user.id;

  //Update the review
  await review.update(req.body);

  //Return the updated review (make sure the call to update actually updates the variable)
  return res.json(review);
});

//Delete a Review: Delete an existing review.
router.delete("/:reviewId", requireAuth, async(req, res, _next) => {
  //Look up the review to be deleted (filter out reviews not owned by the user)
  const review = await Review.findByPk(parseInt(req.params.reviewId), {
    where: {
      ownerId: req.body.id
    }
  });

  //If no spot is found return an error message
  if (!review) {
    return res.status(404).json({message: "Review couldn't be found"});
  }

  //Delete the spot
  await review.destroy();

  //Yay!
  return res.json({message: "Successfully deleted"});
});

module.exports = router;