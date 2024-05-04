const express = require('express');

const { requireAuth } = require('../../../utils/auth');
const {ReviewImage, Review, User } = require('../../../db/models');

const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../../../utils/validation');

const router = express.Router();

/*
### Delete a Review Image

Delete an existing image for a Review.

* Require Authentication: true
* Require proper authorization: Review must belong to the current user
* Request
  * Method: DELETE
  * URL: /api/review-images/:imageId
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

* Error response: Couldn't find a Review Image with the specified id
  * Status Code: 404
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "Review Image couldn't be found"
    }
    ```

*/

router.delete("/:imageId", requireAuth, async(req, res, _next) => {


    //be aware of what type req.params is returning
  const image = await ReviewImage.findByPk(parseInt(req.params.imageId), {
    include: {
      model: Review,
    }
  });


  if (image === null) {
     return res.status(404).json({ message: "Review Image couldn't be found" })
  }



  if (image.Review.userId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" })
  }

  //delete image 
  await image.destroy()

  return res.json({ message: "Successfully deleted" })

})

module.exports = router;