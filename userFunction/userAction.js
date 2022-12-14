const User = require("../model/userModel");
const Post=require("../model/postModel");
const jwt = require("jsonwebtoken");

// register user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "provide all document",
      });
    }

    let lgUser;
    if (User.length > 0) {
      lgUser = await User.findOne({ email: email });
    }

    if (lgUser) {
      return res.status(400).json({
        success: false,
        message: "user already register",
      });
    }

    const user = await User.create({ name, email, password });

    const token = jwt.sign({ email: email }, process.env.jwtPrivateKey);

    await user.save();

    const option = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.status(200).cookie("token", token, option).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: error.message,
    });
  }
};

// get all data of user

exports.getAllUser = async (req, res) => {
  try {
    const data = await User.find().populate('posts');

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: error.message,
    });
  }
};

// login for user
exports.userLogin = async (req, res) => {
  try {
    const { password, email } = req.body;

    if (!password || !email) {
      return res.status(400).json({
        success: false,
        message: "provide all data",
      });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(200).json({
        success: false,
        message: "register first",
      });
    }

    const token = jwt.sign({ email: email }, process.env.jwtPrivateKey);

    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      .json({
        success:true,
        user
      });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: error.message,
    });
  }
};

// delete user
exports.deleteUser=async(req,res)=>{
  try {
    
    // delete all the post of the use

    req.user.posts.map(async(postId,index)=>{
      const postOfUser=await Post.findOne({_id:postId});
      
      if(postOfUser)
       await postOfUser.remove();
    })

    // delete userId from like array of post that like by user
    req.user.likedPosts.map(async(postId,index)=>{
      const likedPost=await Post.findOne({_id:postId});
      if(likedPost)
      {
        let index=-1;
        index=likedPost.likes.indexOf(req.user._id);
        if(index>=0)
        {
          likedPost.likes.splice(index,1);
          await likedPost.save();
        }
      }
    })

    await req.user.remove();

    res.status(200).cookie("token",null,{
      expires:new Date(Date.now()),
      httpOnly:true
    }).json({
      success:true,
      message:"your account is deleted"
    })


  } catch (error) {
    res.status(200).json({
      success: false,
      message: error.message,
    });
  }
}

// logout user

exports.logout=async(req,res)=>{
  try {
    
    res.status(200).cookie("token",null,{
      expires:new Date(Date.now()),
      httpOnly:true
    }).json({
      success:true,
      message:"you are logout"
    })

  } catch (error) {
    res.status(200).json({
      success: false,
      message: error.message,
    });
  }
}

