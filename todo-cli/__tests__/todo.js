/* eslint-disable no-undef */
const todoList = require('../todo')
const {all,markAsComplete,add,dueLater,dueToday,overdue} = todoList();
describe("Todolist test suite",()=>{
    beforeAll(()=>{
        add({
            title: "Test Todo",
            completed: false,
            dueDate: new Date().toISOString().split("T")[0]
        }
        )
    })
    const formattedDate = d => {
      return d.toISOString().split("T")[0]
    }
    
    var dateToday = new Date()
    const today = formattedDate(dateToday)
    const yesterday = formattedDate(
      new Date(new Date().setDate(dateToday.getDate() - 1))
    )
    const tomorrow = formattedDate(
      new Date(new Date().setDate(dateToday.getDate() + 1))
    )
    test("should add new todo",()=>{
        const todoItemsCount = all.length;
        add(
            {
               title: "Test Todo",
                completed: false,
                dueDate: new Date().toISOString().split("T")[0]
        }

        );
        expect(all.length).toBe(todoItemsCount+1) ;
    })
    test("should mark as complete",()=>{
        expect(all[0].completed).toBe(false);
        markAsComplete(0);
        expect(all[0].completed).toBe(true);
    })
    test('retrieving overdue items', () => {
              
      add(
        {
           title: "Test Todo",
            completed: false,
            dueDate: yesterday
    })
    add({
     title: "Todo",
       completed: false,
       dueDate: yesterday
    })
  add({
  title: "Test",
   completed: false,
   dueDate: yesterday
    })
   expect(overdue().length).toBe(3);

     
    });
  
    test('retrieving due today items', () => {

      add(
        {
           title: "Test Todo",
            completed: false,
            dueDate: today
    })
    add({
      title: "Todo",
       completed: false,
       dueDate: today
    })
   add({
  title: "Test",
   completed: false,
   dueDate: today
    })
   expect(dueToday().length).toBe(5);
      
    });
  
    test('retrieving due later items', () => {
      add(
        {
           title: "Test Todo",
            completed: false,
            dueDate: tomorrow
    })
    add({
      title: "Todo",
       completed: false,
       dueDate: tomorrow
       })
    add({
     title: "Test",
   completed: false,
   dueDate: tomorrow
    })
   expect(dueLater().length).toBe(3);
     
    });
    })


