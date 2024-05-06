const express = require('express');

const { requireAuth } = require('../../../utils/auth');
const { Review, Spot, SpotImage, User } = require('../../../db/models');

const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../../../utils/validation');

const router = express.Router();

/*
### Delete a Review

Delete an existing review.

* Require Authentication: true
* Require proper authorization: Review must belong to the current user
* Request
  * Method: DELETE
  * URL: /api/reviews/:reviewId
  * Body: none

* Successful Response
  * Status Code: 200
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "Successfully deleted"
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

router.delete("/:reviewId", requireAuth, async(req, res, _next) => {
    //find spot
    //if spot not found return error
    //if spot is found, delete it

    //be aware of what type req.params is returning
    const review = await Review.findByPk(
        parseInt(req.params.reviewId)
    );


    if (review === null) {
        return res.status(404).json({ message: "Review couldn't be found" })
    }

    if (review.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" })
    }

    //delete spot
    await review.destroy()

    return res.json({ message: "Successfully deleted" })
})

module.exports = router;