/* eslint-disable no-undef */
function todoList() {
    all = [];
    const add = (todoItem) => {
      all.push(todoItem);
    };
    const markAsComplete = (index) => {
      all[index].completed = true;
    };
  
    function isDueToday(dueDate) {
      const today = new Date().toISOString().split("T")[0];
      return (
        dueDate == today
      );
    }
  
    function toString(all) {
      //const options = new Date().toISOString().split("T")[0];
      const dueDate = isDueToday(all.dueDate)
        ? ""
        : all.dueDate;
      const status = all.completed ? "[x]" : "[ ]";
  
      return `${status} ${all.title} ${dueDate}`;
    }
  
  
  
  
    const overdue = () => {
      return all.filter(
        (todo) => todo.dueDate < new Date().toISOString().split("T")[0]
      );
  
    };
  
  
    const dueToday = () => {
      return all.filter((todo) => todo.dueDate === new Date().toISOString().split("T")[0]);
  
      // Write the date check condition here and return the array
      // of todo items that are due today accordingly.
    };
  
    const dueLater = () => {
      return all.filter(
        (todo) => todo.dueDate > new Date().toISOString().split("T")[0]
      );
      // Write the date check condition here and return the array
      // of todo items that are due later accordingly.
    };
  
    const toDisplayableList = (list) => {
      return list.map((todo) => toString(todo)).join("\n");
  
    };
  
    return {
      all,
      add,
      markAsComplete,
      overdue,
      dueToday,
      dueLater,
      toDisplayableList
    };
  }

  module.exports = todoList;
    
    
    
    
    
    
    
    