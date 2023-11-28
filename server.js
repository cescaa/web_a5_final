// CESCA DELA CRUZ
// WEB 322 - NOV 27 2023
// A5
// WEBSITE: https://silly-nightgown-calf.cyclic.app/
//////////////////////////////
// NOTE: used prof's "CLEAN" VERSION OF A4 to complete A5

const legoData = require("./modules/legoSets");
const path = require("path");

const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true })); // ADDED for A5

const HTTP_PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

/*
app.get("/addSet", (req, res) => {
  res.render("addSet");
}); */

/* 
GET /lego/add ~~~~
- request to a Promise-based "getAllThemes()" function (to be added later in the legoSets.js module)
- Once  Promise is resolved, the "addSet" view must be rendered with them, ie:res.render("addSet", { themes: themeData }); */
app.get("/addSet", async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render("addSet", { themes });
  } catch (error) {
    console.log("encountered error: ", error);
  }
});

/* POST /lego/addSet
- request to a Promise-based "addSet(setData)" function (to be added later in thelegoSets.js module)
- provide the data in req.body as the "setData" parameter.
- Once the Promise has resolved, redirect the user to the "/lego/sets" route.
- If an error was encountered, instead render the new "500" view with an appropriate message
 */

// add POST ~~~~
app.post("/lego/addSet", async (req, res) => {
  try {
    const setData = {
      name: req.body.name,
      year: req.body.year,
      num_parts: req.body.num_parts,
      img_url: req.body.img_url,
      theme_id: req.body.theme_id,
      set_num: req.body.set_num,
    };

    await legoData.addSet(setData);
    res.redirect("/lego/sets");
  } catch (error) {
    res.status(500).render("500", {
      message: `encountered error: ${error}`,
    });
    console.log("showing lego/addSet......");
  }
});

//.... routes for EDIT SET.......
// GET ~~~~
app.get("/lego/editSet/:num", async (req, res) => {
  try {
    const set_num = req.params.num;
    const set = await legoData.getSetByNum(set_num);
    const themes = await legoData.getAllThemes();

    res.render("editSet", { themes, set });
  } catch (error) {
    res.status(404).render("404", { message: error.message });
    console.log("showing /editSet/:num....");
  }
});

// POST ~~~~
app.post("/lego/editSet", async (req, res) => {
  try {
    const set_num = req.body.set_num;
    const setdat = req.body;
    await legoData.editSet(set_num, setdat);

    res.redirect("/lego/sets");
  } catch (error) {
    res.status(500).render("500", {
      message: `encountered error: ${error}`,
    });
  }
  console.log("showing /lego/editSet....");
});

// DELETE ROUTEE
app.get("/lego/deleteSet/:num", async (req, res) => {
  try {
    const set_num = req.params.num;
    await legoData.deleteSet(set_num);

    res.redirect("/lego/sets");
  } catch (error) {
    res.status(500).render("500", {
      message: `encountered error: ${error}`,
    });
    console.log("showing lego/deleteSet......");
  }
});

app.get("/lego/sets", async (req, res) => {
  let sets = [];

  try {
    if (req.query.theme) {
      sets = await legoData.getSetsByTheme(req.query.theme);
    } else {
      sets = await legoData.getAllSets();
    }

    res.render("sets", { sets });
  } catch (error) {
    res.status(404).render("404", { message: error });
  }
});

app.get("/lego/sets/:num", async (req, res) => {
  try {
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", { set });
  } catch (error) {
    res.status(404).render("404", { message: error });
  }
});

app.use((req, res, next) => {
  res.status(404).render("404", {
    message: "sorry were unbale to find what youre looking for",
  });
});

legoData.initialize().then(() => {
  app.listen(HTTP_PORT, () => {
    console.log(`server listening on: ${HTTP_PORT}`);
  });
});
