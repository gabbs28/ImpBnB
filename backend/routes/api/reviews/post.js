const express = require('express');
const { requireAuth } = require('../../../utils/auth');

const { Review, Spot, SpotImage, User } = require('../../../db/models');

const { validateReview } = require('./validate.js');

const router = express.Router();


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
      
        const numOfImages = await review.countReviewImages()

        if (numOfImages >= 10){
          return res.status(403).json({ message: "Maximum number of images for this resource was reached" })
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