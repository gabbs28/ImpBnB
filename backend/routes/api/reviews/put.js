const express = require('express');

const { requireAuth } = require('../../../utils/auth');

const { Review, ReviewImages, User } = require('../../../db/models');

const { validateReview } = require('./validate.js');

const router = express.Router();

/*
### Edit a Review

Update and return an existing review.

* Require Authentication: true
* Require proper authorization: Review must belong to the current user
* Request
  * Method: PUT
  * URL: /api/reviews/:reviewId
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
  * Status Code: 200
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
      "updatedAt": "2021-11-20 10:06:40"
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
*/


router.put("/:reviewId", requireAuth, validateReview, async(req, res, _next) => {

  //looking for review to add image to
  const review = await Review.findByPk(req.params.reviewId)
 
  //check if review was found
  if (review === null) {
    return res.status(404).json({ message: "Review couldn't be found" })
  }
  //check if review belongs to current user
  if (review.userId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" })
  }
   
  await review.update(req.body)
 
  return res.json(review)
 })

module.exports = router;