const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
// Middleware to handle try catch blocks for all async methods
const asyncHandler = require('../middleware/async');


// @desc    Get all courses
// @route   Get /api/v1/courses
// @route   Get /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler( async (req, res, next) => {
    let query;

    if (req.params.bootcampId) {
        // No await bevause building query
        query = Course.find({bootcamp: req.params.bootcampId})
    } else {
        query = Course.find().populate({
            path: 'bootcamp',
            select: 'name description'
        });
    }

    const courses = await query;

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    });
});


// @desc    Get single course
// @route   Get /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler( async (req, res, next) => {
    const courseId = req.params.id 
    const course = await Course.findById(courseId).populate({
        path: 'bootcamp',
        select: 'name description'
    })

    if (!course){
        return next(new ErrorResponse(`No Course with the id of ${courseId}`, 404))
    }

    res.status(200).json({
        success: true,
        data: course
    });
});


// @desc    Create new course
// @route   Post /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.createCourse = asyncHandler( async (req, res, next) => {
    // const req.body.bootcamp = req.params.bootcampId


    // const course = await Course.create(req.body);

    // res.status(200).json({
    //     success: true,
    //     data: course
    // });
});