const { request, response } = require("express");
var csrf = require("tiny-csrf");
const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const flash = require("connect-flash");

//var csurf = require("tiny-csrf");
const express = require("express");
const app = express();
const { Todo, User } = require("./models");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
app.set("view engine", "ejs");
app.use(flash());
app.use(
  session({
    secret: "my-super-secret-key-21728172615261562",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.use(passport.initialize());
app.use(passport.session());
app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({
        where: {
          email: username,
        },
      })
        .then(async (user) => {
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid Password" });
          }
        })
        .catch((error) => {
          return done(null, false, {
            message: "Account doesn't exist for this mail id",
          });
        });
    }
  )
);

app.get("/signup", (request, response) => {
  response.render("signup", {
    title: "Sign up",
    csrfToken: request.csrfToken(),
  });
});

app.get(
  "/todos",
  connectEnsureLogin.ensureLoggedIn(),
  async (request, response) => {
    const loggedInUser = request.user.id;
    const overdue = await Todo.overdueTodo(loggedInUser);
    const duetoday = await Todo.duetodayTodo(loggedInUser);
    const duelater = await Todo.duelaterTodo(loggedInUser);
    const completed = await Todo.markAsCompleteditems(loggedInUser);

    if (request.accepts("html")) {
      response.render("todo", {
        title: "Todo application",
        overdue,
        duelater,
        duetoday,
        completed,
        csrfToken: request.csrfToken(),
      });
    } else {
      response.json({
        overdue,
        duetoday,
        duelater,
        completed,
      });
    }
  }
);

app.post("/users",async (request, response) => {
  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  console.log(hashedPwd);
  try {
    const user = await User.create({
      firstName: request.body.firstName,
      lasttName: request.body.lastName,
      email: request.body.email,
      password: hashedPwd,
    });
    request.login(user, (err) => {
      if (err) {
        console.log(err);
      }
      response.redirect("todos");
    });
  } catch (error) {
    console.log(error);
  }
});
app.get("/", async (request, response) => {
  response.render("index", {
    title: "Todo application",
    csrfToken: request.csrfToken(),
  });
});

app.get("/login", (request, response) => {
  response.render("login", { title: "Login", csrfToken: request.csrfToken() });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (request, response) => {
    console.log(request.user);
    response.redirect("/todos");
  }
);
app.use(express.static(path.join(__dirname, "public")));

app.get("/todos", async (request, response) => {
  try {
    const todos = await Todo.findAll({ order: [["id", "ASC"]] });
    return response.json(todos);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});
app.post("/todos",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  console.log("creating a todo", request.body);
  try {
    await Todo.addTodo({
      title: request.body.title,
      dueDate: request.body.dueDate,
      completed: false,
      userId: request.user.id
    });
    return response.redirect("/todos");
  } catch (error) {
    console.log("error");
    return response.status(422).json(error);
  }
});

app.put("/todos/:id",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  console.log("update a todo", request.params.id);
  const todo = await Todo.findByPk(request.params.id);

  try {
    const updatedTodo = await todo.markAsCompleted();
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.delete("/todos/:id",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (todo) {
      await todo.delete();
      return response.json(true);
    } else {
      return response.json(false);
    }
  } catch (error) {
    console.log(error);
    return response.status(422).json(false);
  }
});

app.get("/signout",(request,response,next)=>{
  request.logOut((err)=>{
    if(err){return next(err);}
    response.redirect("/");
  })
})
module.exports = app;
