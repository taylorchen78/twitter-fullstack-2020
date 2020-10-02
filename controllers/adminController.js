const helpers = require('../_helpers')
const db = require('../models')
const reply = require('../models/reply')
const Tweet = db.Tweet
const User = db.User
const Reply = db.Reply

const adminController = {
  signInPage: (req, res) => {
    return res.render('admin/signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/admin/tweets')
  },
  signOut: (req, res) => {
    req.flash('success_messages', '成功登出！')
    req.logout()
    res.redirect('/admin/signin')
  },
  getTweets: (req, res) => {
    return Tweet.findAll({
      include: [User],
      order: [['createdAt', 'DESC']]
    }).then(data => {
      const tweets = data.map(item => ({
        ...item.dataValues,
        description: item.dataValues.description.substring(0, 50)
      }))
      // res.json({ tweets })
      res.render('admin/tweets', { tweets: tweets })
    })
  },
  getUsers: (req, res) => {
    return User.findAll({
      include: [
        Tweet,
        Reply,
        { model: Tweet, as: 'LikedTweets' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' },
      ]
    }).then(results => {
      const data = results.map(item => ({
        ...item.dataValues,
        LikesCount: item.dataValues.LikedTweets.length,
        TweetsCount: item.dataValues.Tweets.length,
        followersCount: item.dataValues.Followers.length,
        followingsCount: item.dataValues.Followings.length,
        // RepliesCount: item.dataValues.Replies.length,
      }))
      const users = data.sort((a, b) => b.tweetsCount - a.tweetsCount)
      res.render('admin/users', { users })
      // res.json({ users })
    })
  },
  deleteTweet: (req, res) => {
    const id = Number(req.params.id)

    return Tweet.findByPk(id).then(tweet => {
      if (tweet === null) {
        res.redirect('/admin/tweets')
      } else {
        tweet.destroy()
          .then(() => res.redirect('/admin/tweets'))
      }
    }).catch(err => console.log(err))
  }
}

module.exports = adminController