const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('../../../utils/validation');

/** Error Response: Body validation error
  * Status Code: 400
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
      "errors": {
        "address": "Street address is required",
        "city": "City is required",
        "state": "State is required",
        "country": "Country is required",
        "lat": "Latitude is not valid",
        "lng": "Longitude is not valid",
        "name": "Name must be less than 50 characters",
        "description": "Description is required",
        "price": "Price per day is required"
      }
    }
    ```

*/

const validateSpot = [
    body('address')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage('Street address is required'),
    body('city')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage('City is required'),
    body('state')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage('State is required'),
    body('country')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage('Country is required'),
    body('lat')
      .exists({ checkFalsy: true })
      .notEmpty()
      .isDecimal()
      .withMessage('Latitude is not valid'),
    body('lng')
      .exists({ checkFalsy: true })
      .notEmpty()
      .isDecimal()
      .withMessage('Longitude is not valid'),
    body('name')
      .exists({ checkFalsy: true })
      .notEmpty()
      .isLength({ min: 1, max: 49 })
      .withMessage('Name must be less than 50 characters'),
    body('description')
      .exists({ checkFalsy: true })
      .notEmpty()
      .withMessage('Description is required'),
    body('price')
      .exists({ checkFalsy: true })
      .notEmpty()
      .isInt()
      .withMessage('Price per day is required'),
    handleValidationErrors
];


/* Error Response: Query parameter validation errors
  * Status Code: 400
  * Headers:
    * Content-Type: application/json
  * Body:

    ```json
    {
      "message": "Bad Request", // (or "Validation error" if generated by Sequelize),
      "errors": {
        "page": "Page must be greater than or equal to 1",
        "size": "Size must be greater than or equal to 1",
        "maxLat": "Maximum latitude is invalid",
        "minLat": "Minimum latitude is invalid",
        "minLng": "Maximum longitude is invalid",
        "maxLng": "Minimum longitude is invalid",
        "minPrice": "Minimum price must be greater than or equal to 0",
        "maxPrice": "Maximum price must be greater than or equal to 0"
      }
    }
     * Query Parameters
    * page: integer, minimum: 1, maximum: 10, default: 1
    * size: integer, minimum: 1, maximum: 20, default: 20
    * minLat: decimal, optional
    * maxLat: decimal, optional
    * minLng: decimal, optional
    * maxLng: decimal, optional
    * minPrice: decimal, optional, minimum: 0
    * maxPrice: decimal, optional, minimum: 0

    ``*/

    const validateGetSpotQueryParams = [
      query('page')
        .default(1)  
        .isInt({ min: 1, max: 10 })
        .withMessage('Page must be greater than or equal to 1'),
      query('size')
        .default(20)
        .isInt({ min: 1, max: 20 })
        .withMessage('Size must be greater than or equal to 1'),
      query('minLat')
        .optional()
        .isFloat({min: -90, max: 90})
        .withMessage('Minimum latitude is invalid'),
      query('maxLat')
        .optional()
        .isFloat({min: -90, max: 90})
        .withMessage('Maximum latitude is invalid'),
      query('minLng')
        .optional()
        .isFloat({min: -180, max: 180})
        .withMessage('Minimum longitude is invalid'),
      query('maxLng')
        .optional()
        .isFloat({min: -180, max: 180})
        .withMessage('Maximum longitude is invalid'),
      query('minPrice')
        .optional()
        .isFloat({ min: 0})
        .withMessage('Minimum price must be greater than or equal to 0'),
      query('maxPrice')
        .optional()
        .isFloat({ min: 0})
        .withMessage('Maximum price must be greater than or equal to 0'),
      handleValidationErrors
  ];


module.exports = {
    validateSpot, validateGetSpotQueryParams
};
