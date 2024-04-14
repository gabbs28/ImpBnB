// backend/routes/api/users.js
const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { Sequelize: Spot, Review, SpotImage, User, Booking } = require('../../db/models');
const { check, body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const validateSpot = [
    body('address')
        .exists({ checkFalsy: true })
        .withMessage('Street address is required'),
    body('city')
        .exists({ checkFalsy: true })
        .withMessage('City is required'),
    body('state')
        .exists({ checkFalsy: true })
        .withMessage('State is required'),
    body('country')
        .exists({ checkFalsy: true })
        .withMessage('Country is required'),
    body('lat')
        .exists({ checkFalsy: true })
        .isDecimal()
        .withMessage('Latitude is not valid'),
    body('lng')
        .exists({ checkFalsy: true })
        .isDecimal()
        .withMessage('Longitude is not valid'),
    body('name')
        .exists({ checkFalsy: true })
        .isLength({ min: 1, max: 49 })
        .withMessage('Name must be less than 50 characters'),
    body('description')
        .exists({ checkFalsy: true })
        .withMessage('Description is required'),
    //does this need to approve decimals?
    body('price')
        .exists({ checkFalsy: true })
        .isInt()
        .withMessage('Price per day is required'),
   
    handleValidationErrors
];


const validateSpotImage = [
    handleValidationErrors
];

const validateReview = [
    body('review')
        .exists({ checkFalsy: true })
        .withMessage('Review text is required'),
    body('stars')
        .exists({ checkFalsy: true })
        .isInt()
        .isLength({min:1, max:5})
        .withMessage('Stars must be an integer from 1 to 5'),

    handleValidationErrors
];

const validateBooking = [
  body('startDate')
    .exists({ checkFalsy: true })
    .isDate()
    .withMessage('startDate is required and must be a date'),
  body('endDate')
    .exists({ checkFalsy: true })
    .isDate()
    .withMessage('endDate is required and must be a date'),
  body('endDate')
    .custom((value, { req }) => {
        const start = new Date(req.body.startDate);
        const end = new Date(value);

        if (end <= start) {
          throw new Error("endDate cannot be on or before startDate");
        }

        return true;
    }),

  handleValidationErrors
];

//Helper functions
const addSpotAverageRating = async (spot, name) => {
  const sum = await Review.sum('stars', {
    where: {
      spotId: spot.id
    }
  });

  if(sum <= 0) {
    return spot[name] = null; // ask phillip if null is okay
  }

  const count =  await getReviewCount(spot);
  
  spot[name] = sum / count;
}

const addSpotPreviewImage = async (spot) => {
  const image = await SpotImage.findOne({
    where: {
      spotId: spot.id,
      preview: true 
    }
  });

  spot.previewImage = image.url;
}

const getReviewCount = async (spot) => {
  return Review.count({
    where: {
      spotId: spot.id
    }
  });
}

const addReviewCount = async (spot, name) => {
  /*
   * if name === numReviews then spot[name] is the same as
   * spot.numReviews = count
   */
  spot[name] = await getReviewCount(spot);
}

//routes go here

//Get all Spots
router.get("/", async(req, res, _next) => {
  //Search for spots
  const spots = (await Spot.findAll({
    where: filters
  }))
    .map(spot => spot.toJSON());

  for(const spot of spots) {
    await addSpotAverageRating(spot, "avgRating");
    await addSpotPreviewImage(spot);
  }

  return res.json({Spots: spots});
});

// Get all Spots owned by the Current User
router.get("/current", requireAuth, async(req, res, _next) => {
    const spots = (await Spot.findAll({
      where: {
        ownerId : req.user.id
      }
    })).map(spot => spot.toJSON());

    //
    for(const spot of spots) {

      await addSpotAverageRating(spot, "avgRating"); 
      //awaiting it bc it is an async func
      await addSpotPreviewImage(spot);
    }
  
    return res.json({Spots: spots});
});

//Get details of spot from an id
// /api/spots/3 <-- my request
// /api/spots/:spotId <-- express
// req.params.spotId === "3"
router.get("/:spotId", async(req, res, _next) => {
  try {
    const spot = (await Spot.findByPk(parseInt(req.params.spotId), { 
      include: [
        {
          model: SpotImage,
          attributes: ['id', 'url', 'preview']
        },
        {
          model: User,
          as: 'Owner',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    })).toJSON();

    await addReviewCount(spot, "numReviews")
    await addSpotAverageRating(spot, "avgStarRating"); 

    return res.json(spot);
  } catch {
    return res.status(404).json({message: "Spot couldn't be found"});
  }
});

//Create a spot
router.post("/", requireAuth, validateSpot, async(req, res, _next) => {
  //Set the spot owner to that of the current user
  req.body.ownerId = req.user.id;

  //Create the spot
  const spot = await Spot.create(req.body);

  return res.status(201).json(spot);
});

//Add an Image to a Spot based on the Spot's id
router.post("/:spotId/images", requireAuth, validateSpotImage, async(req, res, _next) => {
  //Look up the spot to add the image to (filter out spots not owned by the user)
  const spot = await Spot.findByPk(parseInt(req.params.spotId), {
    where: {
      ownerId: req.body.id
    }
  });

  //If no spot is found return an error message
  if (!spot) {
    return res.status(404).json({message: "Spot couldn't be found"});
  }

  //Add the image to the spot
  const image = await spot.addSpotImage(req.body)

  //Return the newly created image
  return res.status(201).json(image);
});

//Edit a Spot
router.put("/:spotId", requireAuth, validateSpot, async(req, res, _next) => {
  //Look up the spot to be edited (filter out spots not owned by the user)
  const spot = await Spot.findByPk(parseInt(req.params.spotId), {
    where: {
      ownerId: req.body.id
    }
  });

  //If no spot is found return an error message
  if (!spot) {
    return res.status(404).json({message: "Spot couldn't be found"});
  }  

  //Make sure the spot will remained owned by the original user
  req.body.ownerId = req.user.id;

  //Update the spot
  await spot.update(req.body);

  //Return the updated spot (make sure the call to update actually updates the variable)
  return res.json(spot);
});

//Delete a Spot
router.delete("/:spotId", requireAuth, async(req, res, _next) => {
  //Look up the spot to be deleted (filter out spots not owned by the user)
  const spot = await Spot.findByPk(parseInt(req.params.spotId), {
    where: {
      ownerId: req.body.id
    }
  });

  //If no spot is found return an error message
  if (!spot) {
    return res.status(404).json({message: "Spot couldn't be found"});
  }

  //Delete the spot
  await spot.destroy();

  //Yay!
  return res.json({message: "Successfully deleted"});
});

//Get all Reviews by a Spot's id
router.get("/:spotId/reviews", async (req, res, _next) => {
  return res.json({
    Reviews: (await Review.findAll({
      where: {
        spotId: req.params.spotId
      }
    }))
  })
});

//Create a Review for a Spot based on the Spot's id
router.post("/:spotId/reviews", requireAuth, validateReview, async (req, res, _next) => {
  //Look up the spot to be deleted (filter out spots not owned by the user)
  const spot = await Spot.findByPk(parseInt(req.params.spotId), {
    where: {
      ownerId: req.body.id
    }
  });

  //If no spot is found return an error message
  if (!spot) {
    return res.status(404).json({message: "Spot couldn't be found"});
  }

  //Add the review for the spot
  const review = await spot.addReview({
    userId: req.user.id,
    spotId: req.params.spotId,
    review: req.body.review,
    stars: req.body.stars
  });

  //Return the newly created review
  return res.status(201).json(review);
});

//Get all Bookings for a Spot based on the Spot's id
// /api/spots/:spotId/bookings
// /api/spots/spots/:spotId/bookings
router.get("/:spotId/bookings", requireAuth, async(req, res, _next) => {
  //Lookup spot based on spotId
  const spot = await Spot.findByPk(parseInt(req.params.spotId));

  //If no spot is found return an error message
  if (!spot) {
    return res.status(404).json({message: "Spot couldn't be found"});
  }

  //Check if we own the spot
  // accessing user from requreAuth
  let owner;
  if (req.user.id === spot.ownerId) {
    owner = true;
  } else {
    owner = false;
  }

  //If not owner
  if (!owner) {
    //Use helper method to look up bookings for the spot
    const bookings = await spot.getBookings({
      attributes: ['spotId', 'startDate', 'endDate']
    });

    //Return bookings
    return res.status(200).json({Bookings: bookings});
  }

  //If owner
  //Use helper method to look up bookings for the spot
  const bookings = await spot.getBookings({
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName']
      }
    ]
  });

  //Return bookings
  return res.status(200).json({Bookings: bookings});
});

//Create a Booking from a Spot based on the Spot's id
router.post("/:spotId/bookings", requireAuth, validateBooking, async(req, res, _next) => {
  //Lookup spot based on spotId
  const spot = await Spot.findByPk(parseInt(req.params.spotId));

  //If no spot is found return an error message
  if (!spot) {
    return res.status(404).json({message: "Spot couldn't be found"});
  }

  //Cannot book our own spot
  if (req.user.id === spot.ownerId) {
    return res.status(403).json({message: "Spot must NOT belong to the current user"});
  }
  
  //|--------|                |------|
  //    A  <-- existing          B <-- existing
  //      |------------------------|
  //                  C <-- new
  //     |---------|        |------|
  //          D                E
  //                 |---|
  //                   F
  const overlap = await Booking.findOne({
    where: {
      spotId: req.params.spotId,
      [Op.or]: [
        {
          startDate: {
            [Op.between]: [req.body.startDate, req.body.endDate]
          }
        },
        {
          endDate: {
            [Op.between]: [req.body.startDate, req.body.endDate]
          }
        }
      ]
    }
  });

  if (overlap) {
    return res.status(403).json({
      message: "Sorry, this spot is already booked for the specified dates",
      errors: {
        startDate: "Start date conflicts with an existing booking",
        endDate: "End date conflicts with an existing booking"
      }
    });
  }

  //Add the booking for the spot
  const booking = await spot.addBooking({
    userId: req.user.id,
    spotId: req.params.spotId,
    startDate: req.body.startDate,
    endDate: req.body.endDate
  });

  //Return bookings
  return res.status(200).json({booking});
});

module.exports = router;