const express = require('express');


const { requireAuth } = require('../../../utils/auth');
const { Booking, Spot, SpotImage, User, Review } = require('../../../db/models');

const router = express.Router();

/*
### Get all of the Current User's Bookings

Return all the bookings that the current user has made.

* Require Authentication: true
* Request
  * Method: GET
  * URL: /api/bookings/current
  * Body: none

* Successful Response
  * Status Code: 200
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "Bookings": [
        {
          "id": 1,
          "spotId": 1,
          "Spot": {
            "id": 1,
            "ownerId": 1,
            "address": "123 Disney Lane",
            "city": "San Francisco",
            "state": "California",
            "country": "United States of America",
            "lat": 37.7645358,
            "lng": -122.4730327,
            "name": "App Academy",
            "price": 123,
            "previewImage": "image url"
          },
          "userId": 2,
          "startDate": "2021-11-19",
          "endDate": "2021-11-20",
          "createdAt": "2021-11-19 20:39:36",
          "updatedAt": "2021-11-19 20:39:36"
        }
      ]
    }
    ```
*/

router.get("/current", requireAuth, async(req, res, _next) => {
  //findAll returns an array of sequelize models
  let bookings = await Booking.findAll({
    where: {
      userId: req.user.id
    },
    include: [
      {
        model: Spot,
        attributes: ["id", "ownerId", "address", "city", "state", "country", "lat", "lng", "name", "price"],
        include: [
          {
            model: SpotImage,
            where: {
              preview: true
            },
            attributes: ["url"],
          }
        ]
      },
    ],
  });

  bookings = bookings.map(booking => booking.toJSON())

  //now I can manipulate the data
  //Review -> star rating -> avgRating
  //SpotImages -> url -> previewImage


  //for (in) is for objects
  //for (of) is for arrays
  for(const booking of bookings){

    //I want to assign SpotImages url to previewImage
    //check if there are no SpotImages

    if (booking.Spot.SpotImages.length === 0) {
      booking.Spot.previewImage = null
    }
    else {
      booking.Spot.previewImage = booking.Spot.SpotImages[0].url
    }
    delete booking.Spot.SpotImages
  }

  return res.json({Bookings: bookings})
})







module.exports = router;