const express = require('express');
const { requireAuth } = require('../../../utils/auth');

const { Review, Spot, SpotImage, User } = require('../../../db/models');

const { validateReview } = require('./validate.js');

const router = express.Router();

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
      "stars": 5,
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

router.post("/:spotId/reviews", requireAuth, validateReview, async(req, res, _next) => {
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
    const review = await spot.createReview(req.body)
  
return res.status(201).json(review)
  }catch(error){
    //first line of code goes to catch
    return res.status(500).json({ message: "User already has a review for this spot" })
  }

  });

  /*### Add an Image to a Review based on the Review's id

Create and return a new image for a review specified by id.

* Require Authentication: true
* Require proper authorization: Review must belong to the current user
* Request
  * Method: POST
  * URL: /api/reviews/:reviewId/images
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "url": "image url"
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
      "url": "image url"
    }
    ```

* Error response: Couldn't find a Review with the specified id
  * Status Code: 404
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "Review couldn't be found"
    }
    ```

* Error response: Cannot add any more images because there is a maximum of 10
  images per resource
  * Status Code: 403
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "Maximum number of images for this resource was reached"
    }
    ```
    */

    router.post("/:reviewId/images", requireAuth, async(req, res, _next) => {
      //check for data in psotman
      //check terminal queries
      //change error message and confirm error message changes
      //now know we are in endpoint but failing at spot not found
        //looking for spot to add image to
        const review = await Review.findByPk(req.params.reviewId)
      
        //check if spot was found
        if (review === null) {
          return res.status(404).json({ message: "Review couldn't be found" })
        }
        //check if spot belongs to current user
        if (review.userId !== req.user.id) {
          return res.status(403).json({ message: "Forbidden" })
        }
      
        //making the image
        //add an image to SpotImages making the spotId matches to the spot.id
        //adding by attaching createSpotImage to spot variable
        const image = await review.createReviewImage(req.body)
      
        const finalImage = image.toJSON()
      
        delete finalImage.reviewId
        delete finalImage.updatedAt
        delete finalImage.createdAt
      
        
        return res.json(finalImage)
      })

module.exports = router;