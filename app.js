const express = require("express");
const bodyParser = require("body-parser");
const mailchimp = require("@mailchimp/mailchimp_marketing");

const app = express();

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
        apiKey: "ea353fc6537800e5fe835c511050b718-us14",
        server: "us14",
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
            res.sendFile(__dirname + "/failure.html");
        } else {
            res.sendFile(__dirname + "/success.html");
        }
    };

    run();
});

app.post("/failure", (req, res) => {
    res.redirect("/");
});
