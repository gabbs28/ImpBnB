const express = require('express');
const { requireAuth } = require('../../../utils/auth');

const { Booking, Spot, SpotImage, User } = require('../../../db/models');

const { validateSpot } = require('./validate.js');

const { validateReview } = require('../reviews/validate.js');

const router = express.Router();

/*
### Create a Spot

Creates and returns a new spot.

* Require Authentication: true
* Request
  * Method: POST
  * URL: /api/spots
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "address": "123 Disney Lane",
      "city": "San Francisco",
      "state": "California",
      "country": "United States of America",
      "lat": 37.7645358,
      "lng": -122.4730327,
      "name": "App Academy",
      "description": "Place where web developers are created",
      "price": 123
    }
    ```

* Successful Response
  * Status Code: 201
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "id": 1,
      "ownerId": 1,
      "address": "123 Disney Lane",
      "city": "San Francisco",
      "state": "California",
      "country": "United States of America",
      "lat": 37.7645358,
      "lng": -122.4730327,
      "name": "App Academy",
      "description": "Place where web developers are created",
      "price": 123,
      "createdAt": "2021-11-19 20:39:36",
      "updatedAt": "2021-11-19 20:39:36"
    }
    ```

* Error Response: Body validation error
  * Status Code: 400
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
      "errors": {
        "address": "Street address is required",
        "city": "City is required",
        "state": "State is required",
        "country": "Country is required",
        "lat": "Latitude is not valid",
        "lng": "Longitude is not valid",
        "name": "Name must be less than 50 characters",
        "description": "Description is required",
        "price": "Price per day is required"
      }
    }
    ```
*/

router.post("/", requireAuth, validateSpot, async(req, res, _next) => {

  req.body.ownerId = req.user.id
  const spot = await Spot.create(req.body)
  
  return res.status(201).json(spot)
})

/*
### Add an Image to a Spot based on the Spot's id

Create and return a new image for a spot specified by id.

* Require Authentication: true
* Require proper authorization: Spot must belong to the current user
* Request
  * Method: POST
  * URL: /api/spots/:spotId/images
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "url": "image url",
      "preview": true
    }
    ```

* Successful Response
  * Status Code: 200
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "id": 1,
      "url": "image url",
      "preview": true
    }
    ```

* Error response: Couldn't find a Spot with the specified id
  * Status Code: 404
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "Spot couldn't be found"
    }
    ```
*/

router.post("/:spotId/images", requireAuth, async(req, res, _next) => {
//check for data in psotman
//check terminal queries
//change error message and confirm error message changes
//now know we are in endpoint but failing at spot not found
  //looking for spot to add image to
  const spot = await Spot.findByPk(req.params.spotId)

  //check if spot was found
  if (spot === null) {
    return res.status(404).json({ message: "Spot couldn't be found" })
  }
  //check if spot belongs to current user
  if (spot.ownerId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" })
  }

  //making the image
  //add an image to SpotImages making the spotId matches to the spot.id
  //adding by attaching createSpotImage to spot variable
  const image = await spot.createSpotImage(req.body)

  const finalImage = image.toJSON()

  delete finalImage.spotId
  delete finalImage.updatedAt
  delete finalImage.createdAt

  
  return res.json(finalImage)
});

/*
### Create a Review for a Spot based on the Spot's id

Create and return a new review for a spot specified by id.

* Require Authentication: true
* Request
  * Method: POST
  * URL: /api/spots/:spotId/reviews
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "review": "This was an awesome spot!",
      "stars": 5
    }
    ```

* Successful Response
  * Status Code: 201
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "id": 1,
      "userId": 1,
      "spotId": 1,
      "review": "This was an awesome spot!",
      "stars": 5,
      "createdAt": "2021-11-19 20:39:36",
      "updatedAt": "2021-11-19 20:39:36"
    }
    ```

* Error Response: Body validation errors
  * Status Code: 400
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
      "errors": {
        "review": "Review text is required",
        "stars": "Stars must be an integer from 1 to 5",
      }
    }
    ```

* Error response: Couldn't find a Spot with the specified id
  * Status Code: 404
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "Spot couldn't be found"
    }
    ```

* Error response: Review from the current user already exists for the Spot
  * Status Code: 500
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "User already has a review for this spot"
    }
    ```
*/

/*
     {
      "id": 1,
      "userId": 1,
      "spotId": 1,
      "review": "This was an awesome spot!",
      "stars": 5,
      "createdAt": "2021-11-19 20:39:36",
      "updatedAt": "2021-11-19 20:39:36"
    }
*/

router.post("/:spotId/reviews", requireAuth, validateReview, async(req, res, next) => {
  //check for data in psotman
  //check terminal queries
  //change error message and confirm error message changes
  //now know we are in endpoint but failing at spot not found
    //looking for spot to add image to
  const spot = await Spot.findByPk(req.params.spotId)
  
    //check if spot was found
  if (spot === null) {
    return res.status(404).json({ message: "Spot couldn't be found" })
  }
  try{
    //code you want to attempt
    req.body.userId= req.user.id
    const review = await spot.createReview(req.body)
  
    return res.status(201).json(review)
  }catch(error) {
    //first line of code goes to catch
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(500).json({ message: "User already has a review for this spot" })
      }

      return next(error);
  }

  });

/*
### Create a Booking from a Spot based on the Spot's id

Create and return a new booking from a spot specified by id.

* Require Authentication: true
* Require proper authorization: Spot must NOT belong to the current user
* Request
  * Method: POST
  * URL: /api/spots/:spotId/bookings
  * Body:

    ```json
    {
      "startDate": "2021-11-19",
      "endDate": "2021-11-20"
    }
    ```

* Successful Response
  * Status Code: 200
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "id": 1,
      "spotId": 1,
      "userId": 2,
      "startDate": "2021-11-19",
      "endDate": "2021-11-20",
      "createdAt": "2021-11-19 20:39:36",
      "updatedAt": "2021-11-19 20:39:36"
    }
    ```

* Error response: Body validation errors
  * Status Code: 400
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
      "errors": {
        "endDate": "endDate cannot be on or before startDate"
      }
    }
    ```

* Error response: Couldn't find a Spot with the specified id
  * Status Code: 404
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "Spot couldn't be found"
    }
    ```

* Error response: Booking conflict
  * Status Code: 403
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "Sorry, this spot is already booked for the specified dates",
      "errors": {
        "startDate": "Start date conflicts with an existing booking",
        "endDate": "End date conflicts with an existing booking"
      }
    }
    ```
*/
router.post("/:spotId/bookings", requireAuth, async(req, res, _next) => {
  //looking for spot
  const spot = await Spot.findByPk(req.params.spotId)

  //check if spot was found
  if (spot === null) {
    return res.status(404).json({ message: "Spot couldn't be found" })
  }
  //check if spot belongs to current user
  if (spot.ownerId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" })
  }
});


module.exports = router;