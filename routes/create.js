/**
 * Created by sparsh on 13/8/16.
 */
var express = require("express");
var Group = require("../models/Group");
var User = require("../models/User");
var router = express.Router();

router.post("/", function (req, res, next) {
    var groupName = req.body.groupName;
    var groupPassword = req.body.groupPassword;

    Group.findOne({groupName: groupName}, function (error, group) {
        if (error) {
            next(error);
        }
        if (group) {
            req.flash("error", "Group already exists");
            res.redirect("/");
        }
        var admin = req.user;

        var newGroup = new Group({
            groupName: groupName,
            groupPassword: groupPassword,
            groupMembers: 1,
            adminId: admin._id
        });
        newGroup.save(next);

        // Add the group _id to admins groups array
        User.update({_id: admin._id}, {$push: {groups: newGroup._id}}, null, function (err, numAffected) {
            if (err) {
                next(err);
            }
            console.log("Udated the groups array");
            next();
        });
    });
} , function (req , res ) {
    console.log("Next called()");
    res.redirect("/");
});

module.exports = router;