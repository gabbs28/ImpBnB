const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../../../utils/validation');

/** Error Response: Body validation errors
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
    */

const validateReview = [
    body('review')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage('Review text is required'),
    body('stars')
      .exists({ checkFalsy: true })
      .notEmpty()
      .isInt({ min: 1, max: 5 })
      .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
];


module.exports = {
    validateReview
};