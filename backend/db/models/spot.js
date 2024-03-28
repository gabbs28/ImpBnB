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
      Spot.belongsTo(models.User, {
        foreignKey: 'ownerId'
      })
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
      unique:true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lat: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      validate: {
        isDecimal: true
      }
    },
    lng: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      validate: {
        isDecimal: true
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1,49]
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: true
      }
    }
  }, {
    sequelize,
    modelName: 'Spot',
  });
  return Spot;
};