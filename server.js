const express = require("express");
const cors = require('cors');
const session = require("express-session");
const MongoStore = require("connect-mongo");
var methodOverride = require('method-override')
const path = require("path");
const app = express();
const connectToMongoDB = require("./config/dbConnect");
const userRouter = require("./routes/users/userRoutes");
const postRouter = require("./routes/posts/postRoutes");
const commentsRoutes = require("./routes/comments/commentsRoutes");
const globalErrHandler = require("./middlewares/GlobalErrHandler");
const appError = require("./util/appError");
const Post = require("./models/posts/postModal");
const truncatePost = require("./util/truncatePost")
require("dotenv").config();
const port = process.env.PORT;
const host = "192.168.40.78";



// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");
app.use(globalErrHandler);
app.use(cors());

// override with the X-HTTP-Method-Override header in the request
// app.use(methodOverride('X-HTTP-Method-Override'))
app.use(methodOverride('_method'))

// Configure express-session
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.URL, // MongoDB connection string
      collectionName: "sessions", // Collection name for storing sessions
      ttl: 3600, // Session TTL (optional)
    }),
  })
);

app.locals.truncatePost = truncatePost

app.use((req, res, next) => {
  if (req.session.authenticated) res.locals.userId = req.session.user;
  else res.locals.userId = null;

  next()
});



//====================BACKEND ROUTES API==============//



// ===================User Routes=====================//
app.use("/api/v1/users", userRouter);

// ===================Post Routes=====================//
app.use("/api/v1/posts", postRouter);

// ===================Comment Routes==================//
app.use("/api/v1/comments", commentsRoutes);


app.get("/", async (req, res) => {
  try {
    const response = await Post.find().populate("author");
   
    res.render("index.ejs", {
      data: response,
      error: null
    });


  } catch (error) {
    // return next(appError(error.message, 500));
    res.render("index.ejs", {
      data: [],
      error: error.message
    });

  }
})

// error  -404 not found
// app.all("*", (req, res, next) => {
//   const err = appError("Page not found....", 404);
//   return next(err);
// });



// Listen to server
app.listen(port, host, () => {
  console.log(`Server is listening on port http://${host}:${port}`);
});

// Calling a function to connect with database
connectToMongoDB();
