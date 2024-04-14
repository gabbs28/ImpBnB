'use strict';

const { Review } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await Review.bulkCreate([
      {
        userId: 1,
        spotId: 1,
        review: "best city studio",
        stars: 4
      },
      {
        userId: 2,
        spotId: 2,
        review: "best city apartment",
        stars: 5
      },
      {
        userId: 3,
        spotId: 3,
        review: "love the riverfront",
        stars: 4
      },
      {
        userId: 1,
        spotId: 3,
        review: "love the riverfront",
        stars: 5
      }
    ], { validate: true })
  },

  async down (queryInterface, Sequelize) {
    //working with options on line 37
    options.tableName = 'Reviews';
    //bringing in the operator class; it's for matching in the where clause
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      review: { [Op.in]: ['best city studio', 'best city apartment', 'love the riverfront'] }
    }, {});
  }
};
