const express = require("express");
const bodyParser = require("body-parser");
const mailchimp = require("@mailchimp/mailchimp_marketing");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.listen(process.env.PORT || 3000, () => {
    console.log("server is listening at 3000");
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/signup.html");
});

app.post("/", (req, res) => {
    const fname = req.body.Fname;
    const lname = req.body.Lname;
    const email = req.body.email;

    mailchimp.setConfig({
        apiKey: process.env.API_KEY,
        server: process.env.SERVER,
    });

    const run = async () => {
        const response = await mailchimp.lists.batchListMembers("3230304ca4", {
            members: [
                {
                    email_address: email,
                    status: "subscribed",
                    merge_fields: {
                        FNAME: fname,
                        LNAME: lname,
                    },
                },
            ],
        });

        if (response.error_count) {
            //res.sendFile(__dirname + "/failure.html");
            const errorCode = response.errors[0].error_code;
            const error = response.errors[0].error;
            const errReason =
                errorCode === "ERROR_CONTACT_EXISTS"
                    ? error.substring(0, 42)
                    : error;

            res.render("failure", { errorType: errReason });
        } else {
            res.sendFile(__dirname + "/success.html");
        }
    };

    run();
});

app.post("/failure", (req, res) => {
    res.redirect("/");
});
