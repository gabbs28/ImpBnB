const express = require('express');

const { requireAuth } = require('../../utils/auth');
const { Booking, Spot, SpotImage, User } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

const validateExample = [
    check('email')
      .exists({ checkFalsy: true })
      .isEmail()
      .withMessage('Please provide a valid email.'),
   
    handleValidationErrors
];

const addSpotPreviewImage = async (spot) => {
  const image = await SpotImage.findOne({
    where: {
      spotId: spot.id,
      preview: true 
    }
  });

  spot.previewImage = image.url;
}

//routes go here

//Get all of the Current User's Bookings
// /api/bookings/current
router.get("/current", requireAuth, async(req, res, _next) => {
  //findAll returns an array of sequelize objects
  const bookings = (await Booking.findAll({
    where: {
      userId : req.user.id
    },
    include: [
      {
        model: Spot,
        attributes: {
          exclude: ['description', 'createdAt', 'updatedAt']
        }
      }
    ]
  })).map(booking => booking.toJSON());
  
  for(const booking of bookings) {
    //awaiting it bc it is an async func
    await addSpotPreviewImage(booking.Spot);
  }
  //console.log(bookings)
  return res.json({Bookings: bookings});
});

//Get all Bookings for a Spot based on the Spot's id
// See spots router

//Create a Booking from a Spot based on the Spot's id
// See spots router

//Edit a Booking
router.put("/:bookingId", requireAuth, async(req, res, _next) => {})

//Delete a Booking
router.delete("/:bookingId", requireAuth, async(req, res, _next) => {
  const booking = await Booking.findByPk(parseInt(req.params.bookingId), {
    where: {
      userId: req.body.id
    }
  });

  //If no spot is found return an error message
  if (!booking) {
    return res.status(404).json({message: "Booking couldn't be found"});
  }

  //check to make sure booking hasnt started
  const currentDate = new Date()
  if (booking.startDate < currentDate) {
    return res.status(403).json({message: "Bookings that have been started can't be deleted"});
  }

  //Delete the spot
  await booking.destroy();

  //Yay!
  return res.json({message: "Successfully deleted"});
});

module.exports = router;