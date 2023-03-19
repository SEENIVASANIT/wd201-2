"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static overdueTodo() {
      return this.findAll({
        where: {
          dueDate: { [Op.lt]: new Date() },
        },
        order: [["dueDate", "ASC"]],
      });
    }
    static markAsCompleteditems() {
      return this.findAll({
        where: {
          completed: true,
        },
        order: [["id", "ASC"]],
      });
    }

    static duetodayTodo() {
      return this.findAll({
        where: {
          dueDate: { [Op.eq]: new Date() },
        },
        order: [["dueDate", "ASC"]],
      });
    }

    static duelaterTodo() {
      return this.findAll({
        where: {
          dueDate: { [Op.gt]: new Date() },
        },
        order: [["dueDate", "ASC"]],
      });
    }
    static getTodos() {
      return this.findAll({ order: [["id", "ASC"]] });
    }
    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }
    static overdueTodo() {
      return this.findAll({
        where: {
          dueDate: { [Op.lt]: new Date() },
          completed: false,
        },
        order: [["dueDate", "ASC"]],
      });
    }

    static duetodayTodo() {
      return this.findAll({
        where: {
          dueDate: { [Op.eq]: new Date() },
          completed: false,
        },
        order: [["dueDate", "ASC"]],
      });
    }

    static duelaterTodo() {
      return this.findAll({
        where: {
          dueDate: { [Op.gt]: new Date() },
          completed: false,
        },
        order: [["dueDate", "ASC"]],
      });
    }
    static remove(id) {
      return this.destroy({
        where: {
          id,
        },
      });
    }
    setCompletionStatus(boolean) {
      return this.update({ completed: boolean });
    }
    markAsCompleted() {
      return this.update({ completed: true });
    }
    delete() {
      return this.destroy();
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    }
  );
  return Todo;
};
