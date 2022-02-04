const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');

// Middleware to handle try catch blocks for all async methods
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');


// @desc    Get all bootcamps
// @route   Get /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    let query;

    let queryStr = JSON.stringify(req.query);
    
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
   
    query = Bootcamp.find(JSON.parse(queryStr));

    const bootcamps = await query;

    res.status(200).json({ 
        success: true, 
        count: bootcamps.length,
        data: bootcamps,
    });  
});

// @desc    Get single bootcamp
// @route   Get /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const bootcamp = await Bootcamp.findById(id);

    if (!bootcamp) {
        // use return here to make sure that in this 
        // if statement the function stops
        return next(new ErrorResponse(`Bootcamp not found with id of ${id}`, 404));

    }

    res.status(200).json({ 
        success: true, 
        data: bootcamp,
    }); 
})

// @desc    Create new bootcamp
// @route   Post /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler( async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({ 
        success: true, 
        data: bootcamp,
    });

});

// @desc    Update new bootcamp
// @route   put /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler( async (req, res, next) => {
    const id = req.params.id;
    const body = req.body;
    
    const bootcamp = await Bootcamp.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    });

    if (!bootcamp) {
        // use return here to make sure that in this 
        // if statement the function stops
        return next(new ErrorResponse(`Bootcamp not found with id of ${id}`, 404));

    }

    res.status(200).json({ 
        success: true, 
        data: bootcamp,
    });

});

// @desc    Delete new bootcamp
// @route   Delete /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler( async (req, res, next) => {
    const id = req.params.id;
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
        // use return here to make sure that in this 
        // if statement the function stops
        return next(new ErrorResponse(`Bootcamp not found with id of ${id}`, 404));

    }

    res.status(200).json({ 
        success: true, 
        data: {},
    });
})


// @desc    Get bootcamps within a radius
// @route   Delete /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler( async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude
 
    // Calc radius using radians
    // Divide distance by radius of earth
    // Earth Radius = 3,963 mi / 6,378 km
    const earthRadiusMi = 3963;
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: { $geoWithin: { $centerSphere: [ [ lng, lat ], radius ]}}
    })

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
  
})


