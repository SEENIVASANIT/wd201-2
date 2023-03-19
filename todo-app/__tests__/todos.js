const request = require("supertest");
var cheerio = require("cheerio");
const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractCsrfToken(res){
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}
describe("Todo test suite",()=>{
    beforeAll(async ()=>{
        await db.sequelize.sync({force: true });
        server = app.listen(4000,()=>{});
        agent = request.agent(server);
    });
    afterAll(async ()=>{
        await db.sequelize.close();
        server.close(); 
    })
    test("Creates a todo and responds with json at /todos POST endpoint", async () => {
      const res = await agent.get("/");
      const csrfToken = extractCsrfToken(res);
        const response = await agent.post("/todos").send({
          title: "Buy bus",
          dueDate: new Date().toISOString(),
          completed: false,
          "_csrf": csrfToken
        });
        expect(response.statusCode).toBe(302);
        
      });

      test("Marking  a todo with id as complete", async () => {
        let res = await agent.get("/");
        let csrfToken = extractCsrfToken(res);
        await agent.post("/todos").send({
          title: "Buy milk",
          dueDate: new Date().toISOString(),
          completed: false,
          "_csrf": csrfToken, // prettier-ignore
        });
    
        const groupedTodosResponse = await agent
          .get("/")
          .set("Accept", "application/json");
        const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
        const dueTodayCount = parsedGroupedResponse.duetoday.length;
        const latestTodo =
          parsedGroupedResponse.duetoday[dueTodayCount - 1];
        res = await agent.get("/");
        csrfToken = extractCsrfToken(res);
        const markCompleteResponse = await agent
          .put(`/todos/${latestTodo.id}`)
          .send({
            completed: true,
            "_csrf": csrfToken, 
          });
        const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
        expect(parsedUpdateResponse.completed).toBe(true);
      });
      
     /* test('Fetching the all todos', async () => {
         await agent.post("/todos").send({
            title: "Buy bullet",dueDate: new Date().toISOString(),completed: false,
          });
          await agent.post("/todos").send({
            title: "Buy train",dueDate: new Date().toISOString(),completed: false,
          });
          await agent.post("/todos").send({
            title: "Buy flight",dueDate: new Date().toISOString(),completed: false,
          });
          const resp= await agent.get("/todos");
          const parse = JSON.parse(resp.text);
      
          expect(parse.length).toBe(5);
          expect(parse[3]["title"]).toBe("Buy train");
      });*/

      test('Deletes an existing to-do and returns true', async () => {
        let res = await agent.get("/");
        let csrfToken = extractCsrfToken(res);
        await agent.post("/todos").send({
          title: "Buy Car",
          dueDate: new Date().toISOString(),
          completed: false,
          "_csrf": csrfToken, 
        });
    
        const groupedTodosResponse = await agent
          .get("/")
          .set("Accept", "application/json");
    
        const parsedResponses = JSON.parse(groupedTodosResponse.text);
        const Todoid = parsedResponses.duetoday.length;
        const latestTodo = parsedResponses.duetoday[Todoid- 1];
    
        res = await agent.get("/");
        csrfToken = extractCsrfToken(res);
    
        const deleteResponses = await agent.delete(`/todos/${latestTodo.id}`).send({
          "_csrf": csrfToken, 
        });
        const parsedUpdateResponse = JSON.parse(deleteResponses.text);
        expect(parsedUpdateResponse).toBe(true); 
      });
})