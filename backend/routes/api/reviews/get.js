const express = require('express');


const { requireAuth } = require('../../../utils/auth');
const { ReviewImage, Spot, SpotImage, User, Review } = require('../../../db/models');

const router = express.Router();


/*
### Get all Reviews of the Current User

Returns all the reviews written by the current user.

* Require Authentication: true
* Request
  * Method: GET
  * URL: /api/reviews/current
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
          "ReviewImages": [
            {
              "id": 1,
              "url": "image url"
            }
          ]
        }
      ]
    }
    ```
*/

router.get("/current", requireAuth, async(req, res, _next) => {
  //findAll returns an array of sequelize models
  let reviews = await Review.findAll({
    where: {
      //dont need to attached userId to a model bc currently in model.
      userId : req.user.id
    },
    include: [
      {
        model: User,
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: Spot,
        attributes: {
          exclude: ["description", "createdAt", "updatedAt"]
        },
        include: [
          {
            model: SpotImage,
            attributes: ["url"],
          },
        ]
      },
      {
        //model names are singular(meant to respresent one row)
        model: ReviewImage,
        attributes: ["id", "url"],
      }
    ],
  });

  reviews = reviews.map(review => review.toJSON())

  //now I can manipulate the data
  //Review -> star rating -> avgRating
  //SpotImages -> url -> previewImage


  //for (in) is for objects
  //for (of) is for arrays
  for(const review of reviews){

    //I want to assign SpotImages url to previewImage
    //check if there are no SpotImages
    //table name pluralization is based on association
    if (review.Spot.SpotImages.length === 0) {
      review.Spot.previewImage = null
    }
    else {
      review.Spot.previewImage = review.Spot.SpotImages[0].url
    }
    delete review.Spot.SpotImages
  }

  return res.json({Reviews: reviews})
});



module.exports = router;