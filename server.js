const express = require("express");
const app = express();

//mongo db and dotenv stuff
const {MongoClient} = require("mongodb");
require("dotenv").config({path: "stuff.env"});


//opens to cross origin
const cors = require("cors");
app.use(cors());

//express middleware to convert json to javascript objects, neat
app.use(express.json());

//prefered port or 27017
const port = process.env.port | 27017;

//database connection
const url = process.env.DB_HOST + ":" + port;
const user = new MongoClient(url);
const dbName = process.env.DB_DATABASE;

//mongoose for schema and stuff
const mongoose = require("mongoose");
mongoose
    .connect(url)
    .then(() => {console.log("connected!")})
    .catch((error) => console.log("ERROR: " + error));

//schema
const jobSchema = mongoose.Schema({
    _id: Number,
    companyname: String,
    jobtitle: String,
    startdate: Date,
    enddate: Date
});


//model
const job = mongoose.model("job", jobSchema);

//initial connect for debugging mostly
async function initialConnect() {

    //tries to connect
    try {
        await user.connect();
        console.log("connection established")   
    } catch (error) {
        console.log("USER CONNECTION FAILED");
        return
    }

    //gets the database
    const dbConnection = user.db(dbName);

    //default call to collection
    let content = dbConnection.collection("jobs");

    //populates if empty
    let val = await content.find().toArray();
    if (val.length == 0) {
        await content.insertMany([
            {_id: 1, companyname: "Glassbolaget", jobtitle: "Glassman", startdate:"2022-02-14", enddate:"2022-08-17"},
            {_id: 2, companyname: "Glassbolaget2", jobtitle: "GlassSergant", startdate:"2023-02-14", enddate:"2022-08-17"},
            {_id: 3, companyname: "Glassbolaget3", jobtitle: "GlassGeneral", startdate:"2024-01-14", enddate:"2024-04-24"}
        ])
        console.log("populated with basic content")
    }
}

initialConnect();

/*


//generall function to ask database questions
function ask(question){
    //works on asyncronus promises
    return new Promise((resolve, reject) => {
        //tries to ask if fail will return error
        try {
            connection.query(question, function (error, result) {
                //if database error  
                if (error) {
                    return reject(error);
                }
                return resolve(result);
                })   
        } catch (e) {
            reject(e)
        }
    })
}

//removes a database row after id
async function remove(value){
    connection.query("DELETE FROM Jobs WHERE id=" + value.body.remove, function(error){if (error) {throw error;}})   
    return;
}

//creates a new database row with information
async function add(values){
    connection.query("INSERT Jobs VALUES ('" + values.body.id + "','"+ values.body.companyname +"','"+ values.body.jobtitle +"','"+ values.body.startdate + "','"+ values.body.enddate+"')",function(error){if (error) {throw error;}});
    return;
}

//updates content of one entry with the update command
async function update(values){
    console.log(values);
    connection.query("UPDATE Jobs SET companyname = '" + values.body.companyname + "', jobtitle = '" + values.body.jobtitle + "', startdate = '" + values.body.startdate + "', enddate = '" + values.body.enddate + "' WHERE id = '" + values.body.id + "'", function(error){if (error) {throw error;}});
    return;
}


//gets all data
app.get("/data", async (req, res) => {
    let val = await ask("SELECT * FROM Jobs");
    return res.json(val);
})

//gets specific information (full mysql call)
app.get("/data/specific", async (req, res) => {
    let val = await ask(req);
    return res.json(val);;
})

//deletes data
app.delete("/remove", async (req, res) => {
    console.log(req.body);
    let val = await validate(req, 3)
    if (!val == "") {
        return res.json({error: val});
    }
    let num = req.body.remove;
    await remove(req);
    res.json({message: "removed object with id: " + num});
})

//updates data
app.put("/update", async (req, res) => {
    let val = await validate(req, 2);
    if (!val == "") {
        res.json({error: val});
        return;
    }
    await update(req);
    let updated = {
        id: req.body.id,
        companyname: req.body.companyname,
        jobtitle: req.body.jobtitle,
        companyname: req.body.startDate,
        jobtitle: req.body.enddate
    }
    res.json({message: "updated: ", updated});
})

//adds new data
app.post("/add", async (req, res) => {
    let val = await validate(req, 1);
    if (!val == "") {
        res.json({error: val});
        return;
    }
    await add(req);
    let added = {
        id: req.body.id,
        companyname: req.body.companyname,
        jobtitle: req.body.jobtitle
    }

    res.json({message: "added: ", added});
})

//validates input for add/update with more 1/2 respectively
async function validate(query, mode) {
    let size = await ask("SELECT id FROM Jobs")
    let errors = [];

    //loops through the id list to check for matches
    if (mode == 1) {
        for (let index = 0; index < size.length; index++) {
            if (size[index].id == query.body.id) {
                errors.push("Id must be unique")
            }
        }
    }
    //can use an else but prefer another if for readability and future expansion
    if (mode == 2) {
        //same as above but uses a bool and makes sure it has a match instead of the opposite
        let match = false;
        for (let index = 0; index < size.length; index++) {
            if (size[index].id == query.body.id) {
                match = true;
            }
        }   
        if (match == false) {
            errors.push("Input id must match existing id")
        }
    }
    //checks if possible to delete
    if (mode == 3) {
        let match = false;
        for (let index = 0; index < size.length; index++) {
            if (size[index].id == query.body.remove) {
                match = true;
            }
        }   
        if (match == false) {
            return "Input id must match existing id";
        }
        else {
            console.log("worked");
            return "";
        }
    }

    let dateErrStart = false;
    let dateErrEnd = false;
    //a bunch of empty checks
    if (mode == 1) {
        if (query.body.id == "") { errors.push("Must have an id name")};
    }
    if (query.body.companyname == "") { errors.push("Must have a company name")};
    if (query.body.jobtitle == "") { errors.push("Must have a company title")};
    if (query.body.startdate == "") { errors.push("Must have a startdate"); dateErrStart = true};
    if (query.body.enddate == "") { errors.push("Database needs a enddate, if current occupation put in current date"); dateErrEnd = true};

    //lenght validation
    if (query.body.id.length > 2147483647) {errors.push("Id is way to long, like what would you even do with an id thats that large")}
    if (query.body.companyname.length > 20) { errors.push("Company name to long, please abbreviate it or shorten it in similiar fashion")};
    if (query.body.jobtitle.length > 20) { errors.push("Job title name to long, please abbreviate it or shorten it in similiar fashion")};

    //date validation, tries to convert input to date object and logs it if it fails
    let startDate = query.body.startdate;
    let dateObjStart = new Date(startDate);
    if (dateErrStart == false) {
        if (isNaN(dateObjStart)) {errors.push("StartDate in the wrong format please use YYYY-MM-DD, for example 2022-11-27")};
    }
    let endDate = query.body.enddate;
    let dateObjEnd = new Date(endDate);
    if (dateErrEnd == false) {
        if (isNaN(dateObjEnd)) {errors.push("Enddate in the wrong format please use YYYY-MM-DD, for example 2022-11-27")};
    }
    if (dateErrEnd == false && dateErrEnd == false) {
        if(dateObjStart > dateObjEnd){
            errors.push("Start-date can not be earlier than end-date")
        }
    }

    if (!errors.length == 0) {
        return errors;
    }
    else {
        return "";
    }
}
*/