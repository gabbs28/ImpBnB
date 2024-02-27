'use strict';
const {
  Model
} = require('sequelize');
const booking = require('./booking');
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Spot.hasMany(models.SpotImage),
      Spot.hasMany(models.Booking),
      Spot.hasMany(models.Review),
      Spot.belongsTo(models.User),
      Spot.belongsToMany(models.User, {
        through: models.Booking
      }),
      Spot.belongsToMany(models.User, {
        through: models.Review
      })
    }
  }
  Spot.init({
    ownerId: {
      type: DataTypes.STRING,
      allowNull:false,
      
    },
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    lat: DataTypes.DECIMAL,
    lng: DataTypes.DECIMAL,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Spot',
  });
  return Spot;
};