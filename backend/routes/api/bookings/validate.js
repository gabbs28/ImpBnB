const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../../../utils/validation');

/** Error response: Body validation errors
  * Status Code: 400
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
      "errors": {
        "endDate": "endDate cannot be on or before startDate"
      }
    }
    ```
    */

const validateBooking = [
    body("endDate")
      .exists({ checkFalsy: true })
      .notEmpty()
      .isAfter()
      .withMessage('endDate cannot be on or before startDate'),
    handleValidationErrors
];


module.exports = {
    validateBooking
};