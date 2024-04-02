// backend/routes/api/users.js
const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { Spot, Review, SpotImage, User } = require('../../db/models');

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

/*
ASYNC HELPER METHOD TO GET REVIEW AVERAGE
PASS IN A SPOT AND A NAME(VARIES)
*/

const addSpotAverageRating = async (spot, name) => {
  //SELECT SUM(xx) FROM "Reviews" WHERE TRUE (if no where clause)
  //SELECT SUM(xx) FROM "Reviews" WHERE spotId = spot.id
  const sum = await Review.sum('stars', {
    where: {
      spotId: spot.id
    }
  });

  if(sum <= 0) {
    return spot[name] = null; // ask phillip if null is okay
  }

  //we have sum, need to call getReviewCount, sum/count = average
  const count =  await getReviewCount(spot);
  
  spot[name] = sum / count;
}


//-----------------------------------------------------------
/*
ASYNC HELPER METHOD TO GET SPOT PREVIEW IMAGE
PASS IN A SPOT AND A NAME(VARIES)
*/

const addSpotPreviewImage = async (spot) => {
  const image = await SpotImage.findOne({
    where: {
      spotId: spot.id  
    }
  });

  spot.previewImage = image.url;
}


//-----------------------------------------------------------
/*
ASYNC HELPER METHOD TO GET REVIEW COUNT
PASS IN A SPOT AND A NAME(VARIES)
*/
const getReviewCount = async (spot) => {
  return await Review.count({
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

//console.log(getReviewCount(2, Review.review))
//routes go here


//-----------------------------------------------------------


//Get all Spots
router.get("/", async(req, res, next) => {
  //() makes it go first
  const spots = (await Spot.findAll())
    .map(spot => spot.toJSON());

  for(const spot of spots) {

    await addSpotAverageRating(spot, "avgRating"); 
    //awaiting it bc it is an async func
    await addSpotPreviewImage(spot);
  };

  return res.json({Spots: spots});
});

//-----------------------------------------------------------

// Get all Spots owned by the Current User

/*
1. FIRST CHECK AUTH
2. WRITE A QUERY TO GET ALL SPOTS,
3. WHERE SPOTS OWNER ID === CURRENT USER

*/

router.get("/current", requireAuth, async(req, res, next) => {
    const spots = (await Spot.findAll({
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

//-----------------------------------------------------------

//get details of spot from an id

/*
1. QUERY FINDBYPK TO GET SPOT DETAILS
2. INCLUDE SPOT IMAGES
3. NAMED ASSOSICATION TO EAGER LOAD USER THROUGH OWNERID
*/
// /api/spots/3 <-- your request
// /api/spots/:spotId <-- express
// req.params.spotId === "3"
// req.:spotId.spotId
// /api/spots/3/reviews/5?imp=true
// /api/spots/:spotId/reviews/:reviewId
// req.params.spotId === "3" req.params.reviewId === "5"
//req.query.imp === true

router.get("/:spotId", async(req, res, next) => {
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

//-----------------------------------------------------------

//create a spot
router.post("/", requireAuth, validateSpot, async(req, res, next) => {
  //Set the spot owner to that of the current user
  req.body.ownerId = req.user.id;

  //Create the spot
  var spot = await Spot.create(req.body);

  return res.status(201).json(spot);
})

//-----------------------------------------------------------
//Add an Image to a Spot based on the Spot's id

//-----------------------------------------------------------
//Edit a Spot
router.put("/:spotId", requireAuth, validateSpot, async(req, res, next) => {
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

  //Make sure the spot will remained owned by the orginal user
  req.body.ownerId = req.user.id;

  //Update the spot
  await spot.update(req.body);

  //Return the updated spot (make sure the call to update actually updates the variable)
  return res.json(spot);
});

//-----------------------------------------------------------
//Delete a Spot
router.delete("/:spotId", requireAuth, async(req, res, next) => {
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
  await spot.delete();

  //Yay!
  return res.json({message: "Successfully deleted"});
});

//-----------------------------------------------------------
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