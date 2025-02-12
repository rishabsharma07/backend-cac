import { asyncHandler } from "../utils/asyncHandler.js"; 
import { upload } from "../middlewares/multer.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const generateAccessandRefreshTokens= async(userId)=>{
    try {
        const user= await User.findById(userId)
        const accesssToken= user.generateAccessToken()
        const refreshToken= user.generateRefreshToken()

        user.refreshToken= refereshToken
        await user.save({validateBeforeSave: false})

        return{accesssToken, refreshToken}
        
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating referesh and access token")
    }

}




const registerUser=asyncHandler(async(req,res)=>{
    // res.status(200).json({
    //     message: "ok"
    // })

    //1 get user details from frontend
    //2 validation - not empty
    //3 check if user already exists: username, email
    //4 check for images, check for avatar
    //5 upload them to cloudinary, avatar
    //6 create user object - create entry in db
    //7 remove password and refresh token field from response
    //8 check for user creation
    //9 return res


    //1
    const {fullName, email, username, password}= req.body
    // console.log(req.body);
    
    // console.log("email:", email);


    //2
    // if(fullName==""){
    //     throw new ApiError(400,"FullName is required")
    // }
    
    // if(email==""){
    //     throw new ApiError(400,"Email is required")
    // }
    
    // if(username==""){
    //     throw new ApiError(400,"Username is required")
    // }
    
    // if(password==""){
    //     throw new ApiError(400,"Password is required")
    // }

    //OR

    if(
        [fullName, email, username, password].some((field)=>
            field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }
    
    //3
    const existedUser= await User.findOne({
        $or:[{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with same email or username")
    }

    //4
    const avatarLocalPath= req.files?.avatar[0]?.path;
    // const coverImageLocalPath= req.files?.coverImage[0]?.path;

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path
    }


    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")}

    //5
    const avatar= await uploadOnCloudinary(avatarLocalPath)    
    const coverImage= await uploadOnCloudinary(coverImageLocalPath) 

    if(!avatar){
        throw new ApiError(400,"Avatar is required")
    }

    //6
    const user= await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    //7
    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //8
    if(!createdUser){
        throw new ApiError(500,"Something went wrong")
    }
    //9
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")

    )    
        
})



//login

const loginUser= asyncHandler(async(req, res)=>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, password, username}= req.body
    console.log(email);
    

    if(!username && !email){
        throw new ApiError(400, "username or email is required")
    }

    const user= await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid= await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
        }
    
    const {accesssToken, refereshToken}= await generateAccessandRefreshTokens(user._id)

    const loggedInUser= await User.findById(user._id).select("-password - refreshToken")


    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accesssToken, refereshToken
            },
            "User loggedIn successfully"
        )
    )
})


const logoutUser= asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{},"User loggedOut"))
    
})

export {
    registerUser,
    loginUser,
    logoutUser
}