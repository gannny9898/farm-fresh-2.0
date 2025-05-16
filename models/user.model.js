module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    full_name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    phone: {
      type: Sequelize.STRING(20),
      allowNull: false
    },
    user_type: {
      type: Sequelize.ENUM('farmer', 'customer', 'admin'),
      allowNull: false
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    farm_name: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    farm_location: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    profile_photo: {
      type: Sequelize.STRING(255),
      allowNull: true
    },
    organic_certified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  });

  return User;
}; 