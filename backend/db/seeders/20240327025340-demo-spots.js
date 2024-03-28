'use strict';

const { Spot } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}


module.exports = {
  async up (queryInterface, Sequelize) {
    await Spot.bulkCreate([
      {
        ownerId: 1,
        address: "2638 Strawberry Lane",
        city: "Long Beach",
        state: "CA",
        country: "United States",
        lat: 33.822873,
        lng: -118.179166,
        name: "Imp's place",
        description: "Retreat in this minimalistic apartment suite.",
        price: 155,
      },
      {
        ownerId: 2,
        address: "4950 Cherry Blvd",
        city: "Seattle",
        state: "WA",
        country: "United States",
        lat: 47.610391,
        lng: -122.306966,
        name: "Emerald City",
        description: "A special place in the city.",
        price: 129,
      },
      {
        ownerId: 3,
        address: "3086 Berry Ave",
        city: "Vida",
        state: "OR",
        country: "United States",
        lat: 44.119665,
        lng: -122.481508,
        name: "Riverfront",
        description: "A little slice of heaven on the McKenzie River.",
        price: 325,
      }
    ], { validate: true })
  },

  async down (queryInterface, Sequelize) {
    //working with options on line 37
    options.tableName = 'Spots';
    //bringing in the operator class; it's for matching in the where clause 
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(options, {
      name: { [Op.in]: ["Imp's place", "Emerald City", 'Riverfront'] }
    }, {});
  }
};
