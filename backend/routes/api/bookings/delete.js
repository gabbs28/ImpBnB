const express = require('express');

const { requireAuth } = require('../../../utils/auth');
const { Booking, Spot, SpotImage, User } = require('../../../db/models');

const router = express.Router();

/*

### Delete a Booking

Delete an existing booking.

* Require Authentication: true
* Require proper authorization: Booking must belong to the current user or the
  Spot must belong to the current user
* Request
  * Method: DELETE
  * URL: /api/bookings/:bookingId
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

* Error response: Couldn't find a Booking with the specified id
  * Status Code: 404
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "Booking couldn't be found"
    }
    ```

* Error response: Bookings that have been started can't be deleted
  * Status Code: 403
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "Bookings that have been started can't be deleted"
    }
    ```
*/


router.delete("/:bookingId", requireAuth, async(req, res, _next) => {
    //find spot
    //if spot not found return error
    //if spot is found, delete it

    //be aware of what type req.params is returning
    const booking = await Booking.findByPk(
        parseInt(req.params.bookingId)
    );


    if (booking === null) {
        return res.status(404).json({ message: "Booking couldn't be found" })
    }

    if (booking.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" })
    }

    let date = new Date();


    if (booking.startDate >= date){
      return res.status(403).json({ message: "Bookings that have been started can't be deleted" })
    }

    //delete spot
    await booking.destroy()

    return res.json({ message: "Successfully deleted" })
})

module.exports = router;
