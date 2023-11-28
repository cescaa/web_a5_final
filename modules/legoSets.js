// CESCA DELA CRUZ
// WEB 322 - NOV 27 2023
// A5
// WEBSITE: https://silly-nightgown-calf.cyclic.app/
//////////////////////////////
// NOTE: used prof's "CLEAN" VERSION OF A4 to complete A5

//require("dotenv").config(); // A5
const dotenv = require("dotenv");
dotenv.config();
const Sequelize = require("sequelize");

// connectt to db
const sequelize = new Sequelize("WEB_A5_DB", "cescaa", "OWo4eKHjtV5x", {
  host: "ep-little-haze-49935306-pooler.us-east-2.aws.neon.tech",
  dialect: "postgres",
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("connection made!");
  })
  .catch((err) => {
    console.log("unable to connect!", err);
  });

//////// define two models
//  "THEME" model
const Theme = sequelize.define(
  "Theme",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
    },
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

// define "SET" model
const Set = sequelize.define(
  "Set",
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    year: {
      type: Sequelize.INTEGER,
    },
    num_parts: {
      type: Sequelize.INTEGER,
    },
    theme_id: {
      type: Sequelize.INTEGER,
    },
    img_url: {
      type: Sequelize.STRING,
    },
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

// make assoc
Set.belongsTo(Theme, { foreignKey: "theme_id" });

/* DELETED CODE FOR A5
const setData = require("../data/setData");
const themeData = require("../data/themeData");
let sets = [];
*/

function initialize() {
  /*
  return new Promise((resolve, reject) => {
    setData.forEach((setElement) => {
      let setWithTheme = {
        ...setElement,
        theme: themeData.find(
          (themeElement) => themeElement.id == setElement.theme_id
        ).name,
      };
      sets.push(setWithTheme);
      resolve();
    });
  }); */
  return sequelize.sync();
}

function getAllSets() {
  /*return new Promise((resolve, reject) => {
    resolve(sets); 
      }); */
  // Name.findAll({
  //attributes: ['fName'],

  // include: [Theme] to include Theme data when invoking "findAll"
  return Set.findAll({ include: [Theme] });
}

function getSetByNum(setNum) {
  /*
  return new Promise((resolve, reject) => {
    let foundSet = sets.find((s) => s.set_num == setNum);

    if (foundSet) {
      resolve(foundSet);
    } else {
      reject("Unable to find requested set");
    }
  }); */
  // resolve the returned Promise with a single set whose set_num value matches the "setNum" parameter. Asbefore, if no set was found, reject the Promise with an error, ie: "Unable to find requested set"
  return Set.findAll({
    where: { set_num: setNum },
    include: [Theme],
  }).then((elem) => {
    if (elem.length > 0) {
      return elem[0];
    } else {
      throw new Error("unbale to find reqeusted set!!");
    }
  });
}

function getSetsByTheme(theme) {
  /*
  return new Promise((resolve, reject) => {
    let foundSets = sets.filter((s) =>
      s.theme.toUpperCase().includes(theme.toUpperCase())
    );

    if (foundSets.length > 0) {
      resolve(foundSets);
    } else {
      reject("Unable to find requested sets");
    }
  }); */

  /* Set.findAll({include: [Theme], where: {'$Theme.name$': {[Sequelize.Op.iLike]: `%${theme}%`}}}); */

  return Set.findAll({
    include: [Theme],
    where: {
      "$Theme.name$": {
        [Sequelize.Op.iLike]: `%${theme}%`,
      },
    },
  }).then((elem) => {
    if (elem.length > 0) {
      return elem;
    } else {
      throw new Error("unbale to find reqeusted sets!!");
    }
  });
}

////// Adding new functionality to legoSets.js module.... (A5)

/*- return a Promise that resolves once a set has been created, or rejects if there was an error.
- Uses the "Set" model to create a new Set with the data from the "setData" parameter.
- Once this function has resolved successfully, resolve the Promise returned by the addSet(setData) function without any data.
- If the function did not resolve successfully, reject the Promise returned by the addSet(setData)function with the message from the first error, ie: err.errors[0].message  */
function addSet(setData) {
  //console.log("testing....");
  return Set.create(setData)
    .then(() => {
      return Promise.resolve();
    })
    .catch((error) => {
      return Promise.reject(error.errors[0].message);
    });
}

/* return a Promise that resolves with all the themes in the database. This can be accomplished using the "Theme" model to return all of the themes in the database */
function getAllThemes() {
  //console.log("testing....");
  return Theme.findAll()
    .then((themes) => {
      return Promise.resolve(themes);
    })
    .catch((error) => {
      return Promise.reject(error.message);
    });
}

// Adding new functionality to legoSets.js module (editSet).....
async function editSet(setNum, setData) {
  //console.log("testing....");

  try {
    const edited_set = await Set.update(setData, {
      where: { set_num: setNum },
      returning: true,
      plain: true, // == ONLY edited set is returned
    });

    if (!edited_set[1]) {
      throw new Error("set not found!!!");
    }

    return edited_set[1];
  } catch (error) {
    return Promise.reject(error.errors[0].message);
  }
}

// delete functionality
async function deleteSet(setNum) {
  //console.log("testing....");
  try {
    const res = await Set.destroy({
      where: { set_num: setNum },
    });

    if (res === 1) {
      return Promise.resolve();
    } else {
      throw new Error("cannot delete; set not found.");
    }
  } catch (error) {
    return Promise.reject(error.errors[0].message);
  }
}

module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  addSet,
  getAllThemes,
  editSet,
  deleteSet,
};

// Code Snippet to insert existing data from Set / Themes
/*
sequelize
  .sync()
  .then(async () => {
    try {
      await Theme.bulkCreate(themeData);
      await Set.bulkCreate(setData);
      console.log("-----");
      console.log("data inserted successfully");
    } catch (err) {
      console.log("-----");
      console.log(err.message);

      // NOTE: If you receive the error:

      // insert or update on table "Sets" violates foreign key constraint "Sets_theme_id_fkey"

      // it is because you have a "set" in your collection that has a "theme_id" that does not exist in the "themeData".

      // To fix this, use PgAdmin to delete the newly created "Themes" and "Sets" tables, fix the error in your .json files and re-run this code
    }

    process.exit();
  })
  .catch((err) => {
    console.log("Unable to connect to the database:", err);
  });
  */
