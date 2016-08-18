/**
 * Created by sparsh on 16/8/16.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Poll = require('../models/Poll');
var Group = require('../models/Group');

var ResponseEnum = require('../ResponseEnum');

router.post('/', function (req, res) {
    console.log("Poll post handler called");
    var groupId = mongoose.Types.ObjectId(req.session.groupId);
    if (groupId) {

        var pollTopic = req.body.pollTopic;
        var days = Number(req.body.timeDays);
        var hours = Number(req.body.timeHours);

        if (isNaN(days) || isNaN(hours)) {
            res.send({redirect: '/'});
        }

        Group.findById(groupId, function (error, group) {
            if (error) {
                res.send({redirect: '/'});
            }
            if (!group) {
                res.send({redirect: '/'});
            }
            console.log("Found the group");

            var notVoted = group.groupMembers;
            var time = (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000);

            var createdAt = new Date();

            var newPoll = new Poll({
                groupId: groupId,

                pollTopic: pollTopic,
                inFavor: 0,
                opposed: 0,
                notVoted: notVoted,
                ongoing: true,

                submittedAt: createdAt,
                stipulatedTime: time,

                voters: [],
                result: "Pending"
            });

            newPoll.save(function (saveError) {
                if (saveError) {
                    res.send({redirect: '/'});
                }
                console.log("Successfully saved the poll");
                res.send({redirect: '/group/' + req.session.groupId});
            });
        });
    }
});

router.post('/:pollId', function (req, res) {

    var vote = Number(req.body.vote);
    var pollId = mongoose.Types.ObjectId(req.params.pollId);
    var voterId = req.user._id;


    if (isNaN(vote)) {
        res.send({redirect: '/'});
    }

    // Update the poll data
    Poll.findById(pollId, function (error, poll) {
        console.log("Found the Poll!!!");
        if (error) {
            res.send({redirect: '/'});
        }

        // Check if the user already exists
        var hasVoted = poll.voters.some(function (voter) {
            return voterId.equals(voter.voterId);
        });

        var inFavor = poll.inFavor;
        var opposed = poll.opposed;
        var notVoted = poll.notVoted;

        // If the user hasn't voted, we add him to the voters list
        if (!hasVoted) {

            if (vote == ResponseEnum.YES) {
                inFavor += 1;
            }
            if (vote == ResponseEnum.NO) {
                opposed += 1;
            }
            notVoted -= 1;

            // Update the poll value
            Poll.update({_id: poll._id}, {
                $push: {voters: {voterId: voterId, response: vote}},
                inFavor: inFavor,
                opposed: opposed,
                notVoted: notVoted
            }, null, function (updateErr, numAffected) {
                if (updateErr) {
                    res.send({redirect: '/'});
                }
                res.send({redirect: '/group/' + req.session.groupId});
            });
        }
        // Else we just alter the values of constants and the user response
        else {
            var response = poll.voters.find(function (voter) {
                return voter.voterId.equals(voterId);
            }).response;

            if (vote == response) {
                res.send({redirect: '/'});
            }

            if (vote == ResponseEnum.YES) {
                inFavor += 1;
                opposed -= 1;
            }
            if (vote == ResponseEnum.NO) {
                opposed += 1;
                inFavor -= 1;
            }
            Poll.update({_id: pollId, 'voters.voterId': voterId}, {
                $set: {'voters.$.response': vote},
                inFavor: inFavor,
                opposed: opposed
            }, function (updateError, numAffected) {
                if (updateError) {
                    res.send({redirect: '/'});
                }
                res.send({redirect: '/group/' + req.session.groupId});
            });
        }
    });
});

module.exports = router;