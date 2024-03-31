'use strict';

const { Spot } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await Review.bulkCreate([
      {
        userId: 1,
        spotId: 2,
        review: "best city studio",
        stars: 4
      },
      {
        userId: 2,
        spotId: 1,
        review: "best city apartment",
        stars: 5
      },
      {
        userId: 3,
        spotId: 3,
        review: "love the riverfront",
        stars: 4
      }

    ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
