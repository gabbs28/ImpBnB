const express = require('express');

const { requireAuth } = require('../../../utils/auth');
const { Booking, Spot, SpotImage, User } = require('../../../db/models');


const router = express.Router();

/*
### Delete a Spot Image

Delete an existing image for a Spot.

* Require Authentication: true
* Require proper authorization: Spot must belong to the current user
* Request
  * Method: DELETE
  * URL: /api/spot-images/:imageId
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

* Error response: Couldn't find a Spot Image with the specified id
  * Status Code: 404
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "Spot Image couldn't be found"
    }
    ```

*/

router.delete("/:imageId", requireAuth, async(req, res, _next) => {

    //be aware of what type req.params is returning
    const image = await SpotImage.findByPk(parseInt(req.params.imageId), {
      include: {
        model: Spot,
      }
    });
  
  
    if (image === null) {
       return res.status(404).json({ message: "Spot Image couldn't be found" })
    }
  
  
  
    if (image.Spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" })
    }
  
    //delete image 
    await image.destroy()
  
    return res.json({ message: "Successfully deleted" })
  
  })

module.exports = router;