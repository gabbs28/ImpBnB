const express = require('express');


const { requireAuth } = require('../../../utils/auth');
const { ReviewImage, Spot, SpotImage, User, Review } = require('../../../db/models');

const { validateGetSpotQueryParams } = require('./validate.js');

const router = express.Router();

/*
### Get all Spots

Returns all the spots.

* Require Authentication: false
* Request
  * Method: GET
  * URL: /api/spots
  * Body: none

* Successful Response
  * Status Code: 200
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "Spots": [
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
          "updatedAt": "2021-11-19 20:39:36",
          "avgRating": 4.5,
          "previewImage": "image url"
        }
      ]
    }
    ```
*/

router.get("/", validateGetSpotQueryParams, async(req, res, _next) => {
  //findAll returns an array of sequelize models
  let page = req.query.page
  let size = req.query.size
  let limit = size;
  let offset = size * (page - 1);

  let spots = await Spot.findAll({
    include: [
      {
        model: Review,
        required: false
      },
      {
        model: SpotImage,
        where: {
          preview: true
        },
        required: false
      }
    ],
    limit, offset
  });

  spots = spots.map(spot => spot.toJSON())

  //now I can manipulate the data
  //Review -> star rating -> avgRating
  //SpotImages -> url -> previewImage


  //for (in) is for objects
  //for (of) is for arrays
  for(const spot of spots){
    let sum = 0

    for(const review of spot.Reviews){
      sum = sum + review.stars
    }

    const count = spot.Reviews.length

    if (count === 0) {
      spot.avgRating = null
    }
    else {
      spot.avgRating = sum / count
    }
    delete spot.Reviews

    //I want to assign SpotImages url to previewImage
    //check if there are no SpotImages

    if (spot.SpotImages.length === 0) {
      spot.previewImage = null
    }
    else {
      spot.previewImage = spot.SpotImages[0].url
    }
    delete spot.SpotImages
  }

  return res.json({Spots: spots, page: req.query.page, size: req.query.size})
})

/*
### Get all Spots owned by the Current User

Returns all the spots owned (created) by the current user.

* Require Authentication: true
* Request
  * Method: GET
  * URL: /api/spots/current
  * Body: none

* Successful Response
  * Status Code: 200
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "Spots": [
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
          "updatedAt": "2021-11-19 20:39:36",
          "avgRating": 4.5,
          "previewImage": "image url"
        }
      ]
    }
*/
router.get("/current", requireAuth, async(req, res, _next) => {
  //findAll returns an array of sequelize models
  let spots = await Spot.findAll({
    where: {
      ownerId: req.user.id
    },
    include: [
      {
        model: Review,
        required: false
      },
      {
        model: SpotImage,
        where: {
          preview: true
        },
        required: false
      }
    ],
  });

  spots = spots.map(spot => spot.toJSON())

  //now I can manipulate the data
  //Review -> star rating -> avgRating
  //SpotImages -> url -> previewImage


  //for (in) is for objects
  //for (of) is for arrays
  for(const spot of spots){
    let sum = 0

    for(const review of spot.Reviews){
      sum = sum + review.stars
    }

    const count = spot.Reviews.length

    if (count === 0) {
      spot.avgRating = null
    }
    else {
      spot.avgRating = sum / count
    }
    delete spot.Reviews

    //I want to assign SpotImages url to previewImage
    //check if there are no SpotImages

    if (spot.SpotImages.length === 0) {
      spot.previewImage = null
    }
    else {
      spot.previewImage = spot.SpotImages[0].url
    }
    delete spot.SpotImages
  }

  return res.json({Spots: spots})
})

/*
### Get details of a Spot from an id

Returns the details of a spot specified by its id.

* Require Authentication: false
* Request
  * Method: GET
  * URL: /api/spots/:spotId
  * Body: none

* Successful Response
  * Status Code: 200
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
      "updatedAt": "2021-11-19 20:39:36" ,
      "numReviews": 5,
      "avgStarRating": 4.5,
      "SpotImages": [
        {
          "id": 1,
          "url": "image url",
          "preview": true
        },
        {
          "id": 2,
          "url": "image url",
          "preview": false
        }
      ],
      "Owner": {
        "id": 1,
        "firstName": "John",
        "lastName": "Smith"
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
*/
router.get("/:spotId", async(req, res, _next) => {
  //findAll returns an array of sequelize models
  let spot = await Spot.findByPk(req.params.spotId, {
    include: [
      {
        model: Review
      },
      {
        model: SpotImage,
        attributes: ["id", "url", "preview"],
      },
      {
        model: User,
        as: "Owner",
        attributes: ["id", "firstName", "lastName"],
      }
    ],
  });

  if (spot === null) {
    return res.status(404).json({ message: "Spot couldn't be found" })
  }

  spot = spot.toJSON()

  //now I can manipulate the data
  //Review -> star rating -> avgRating
  //SpotImages -> url -> previewImage


  //for (in) is for objects
  //for (of) is for arrays

  let sum = 0

  for(const review of spot.Reviews){
    sum = sum + review.stars
  }

  const count = spot.Reviews.length

  spot.numReviews = count

  if (count === 0) {
    spot.avgStarRating = null
  }
  else {
    spot.avgStarRating = sum / count
  }
  delete spot.Reviews


  return res.json(spot)
});

/*
### Get all Reviews by a Spot's id

Returns all the reviews that belong to a spot specified by id.

* Require Authentication: false
* Request
  * Method: GET
  * URL: /api/spots/:spotId/reviews
  * Body: none

* Successful Response
  * Status Code: 200
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "Reviews": [
        {
          "id": 1,
          "userId": 1,
          "spotId": 1,
          "review": "This was an awesome spot!",
          "stars": 5,
          "createdAt": "2021-11-19 20:39:36",
          "updatedAt": "2021-11-19 20:39:36" ,
          "User": {
            "id": 1,
            "firstName": "John",
            "lastName": "Smith"
          },
          "ReviewImages": [
            {
              "id": 1,
              "url": "image url"
            }
          ],
        }
      ]
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

router.get("/:spotId/reviews", async(req, res, _next) => {
  const spot = await Spot.findByPk(req.params.spotId);
// check if spot exists
  if (spot === null) {
    return res.status(404).json({ message: "Spot couldn't be found" })
  }

// have to have a spot in order to get reviews
  const reviews = await spot.getReviews({
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: ReviewImage,
        attributes: ["id", "url"],
      }
    ],
  });

  
  return res.json({Reviews : reviews})
})

/*
### Get all Bookings for a Spot based on the Spot's id

Return all the bookings for a spot specified by id.

* Require Authentication: true
* Request
  * Method: GET
  * URL: /api/spots/:spotId/bookings
  * Body: none

* Successful Response: If you ARE NOT the owner of the spot.
  * Status Code: 200
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "Bookings": [
        {
          "spotId": 1,
          "startDate": "2021-11-19",
          "endDate": "2021-11-20"
        }
      ]
    }
    ```

* Successful Response: If you ARE the owner of the spot.
  * Status Code: 200
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "Bookings": [
        {
          "User": {
            "id": 2,
            "firstName": "John",
            "lastName": "Smith"
          },
          "id": 1,
          "spotId": 1,
          "userId": 2,
          "startDate": "2021-11-19",
          "endDate": "2021-11-20",
          "createdAt": "2021-11-19 20:39:36",
          "updatedAt": "2021-11-19 20:39:36"
        }
      ]
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

router.get("/:spotId/bookings", requireAuth, async(req, res, _next) => {
  const spot = await Spot.findByPk(req.params.spotId);
// check if spot exists
  if (spot === null) {
    return res.status(404).json({ message: "Spot couldn't be found" })
  }


  //Successful Response: If you ARE NOT the owner of the spot.

  //check if spot belongs to current user
  if (spot.ownerId !== req.user.id) {

    const bookings = await spot.getBookings({
      attributes: {
        exclude: ["id", "userId", "createdAt", "updatedAt"]
      }
    });


    return res.json({ Bookings: bookings })
  }

  //Successful Response: If you ARE the owner of the spot.

// have to have a spot in order to get reviews
  const bookings = await spot.getBookings({
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName"],
      }
    ],
  });

  
  return res.json({ Bookings: bookings })

})


module.exports = router;