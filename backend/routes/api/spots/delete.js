const express = require('express');

const { requireAuth } = require('../../../utils/auth');
const { Booking, Spot, SpotImage, User } = require('../../../db/models');

const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../../../utils/validation');

const router = express.Router();

/*
### Delete a Spot

Deletes an existing spot.

* Require Authentication: true
* Require proper authorization: Spot must belong to the current user
* Request
  * Method: DELETE
  * URL: /api/spots/:spotId
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

router.delete("/:spotId", requireAuth, async(req, res, _next) => {
  //find spot
  //if spot not found return error
  //if spot is found, delete it

  //be aware of what type req.params is returning
  const spot = await Spot.findByPk(
    parseInt(req.params.spotId)
  );


  if (spot === null) {
    return res.status(404).json({ message: "Spot couldn't be found" })
  }

  if (spot.ownerId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" })
  }

  //delete spot
  await spot.destroy()

  return res.json({ message: "Successfully deleted" })
})

module.exports = router;

