import { asyncHandler } from "../utils/asyncHandler.js"; 
import { upload } from "../middlewares/multer.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
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
    const existedUser= User.findOne({
        $or:[{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with same email or username")
    }

    //4
    const avatarLocalPath= req.files?.avatar[0]?.path;
    const coverImageLocalPath= req.files?.coverImage[0]?.path;

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



export {registerUser}