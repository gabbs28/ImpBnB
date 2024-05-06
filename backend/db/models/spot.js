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
      Spot.hasMany(models.SpotImage, {
        foreignKey: 'spotId'
      });
      Spot.hasMany(models.Booking, {
        foreignKey: 'spotId'
      });
      Spot.hasMany(models.Review, {
        foreignKey: 'spotId'
      });
      Spot.belongsTo(models.User, {
        foreignKey: 'ownerId'
      });
      Spot.belongsTo(models.User, {
        foreignKey: 'ownerId',
        as: 'Owner'
      });
      // Spot.belongsToMany(models.User, {
      //   through: models.Booking,
      //   foreignKey: "userId"
      // });
    }
  }
  Spot.init({
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull:false
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
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        isDecimal: true
      }
    },
    lng: {
      type: DataTypes.FLOAT,
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