'use strict';

const { Booking } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await Booking.bulkCreate([
      {
        spotId: 1,
        userId: 1,
        startDate: "2025-01-07",
        endDate: "2025-01-17",
      },
      {
        spotId: 1,
        userId: 2,
        startDate: "2025-01-18",
        endDate: "2025-01-28",
      },
      {
        spotId: 2,
        userId: 2,
        startDate: "2025-02-07",
        endDate: "2025-02-17",
      },
      {
        spotId: 3,
        userId: 3,
        startDate: "2025-02-07",
        endDate: "2025-02-17",
      },
      {
        spotId: 3,
        userId: 2,
        startDate: "2025-03-07",
        endDate: "2025-03-17",
      },
      {
        spotId: 3,
        userId: 1,
        startDate: "2025-04-07",
        endDate: "2025-04-17",
      }
    ], { validate: true })
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [1, 2, 3] }
    }, {});
  }
};
