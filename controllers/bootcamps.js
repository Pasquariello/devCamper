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

    // Copy req.query and exclude certain fields
    const { select, sort, page, limit, ...reqQuery } = req.query;

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding Resource
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');
    // Select fields

    if (select) {
        console.log('select', select)
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination 
    const queryPage = parseInt(page, 10) || 1;
    const queryLimit = parseInt(limit, 10) || 25;
    const startIndex = (queryPage - 1) * queryLimit;
    const endIndex = (queryPage * queryLimit);
    const total = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(queryLimit);

    // Executing query
    const bootcamps = await query;

    // Pagination Result
    const pagination = {
        total
    };

    if (endIndex < total){
        pagination.next = {
            page: queryPage + 1,
            limit: queryLimit
        }
    }

    if (startIndex > 0){
        pagination.prev = {
            page: page - 1, 
            limit: queryLimit
        }
    }
    

    res.status(200).json({ 
        success: true, 
        count: bootcamps.length,
        pagination,
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
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
        // use return here to make sure that in this 
        // if statement the function stops
        return next(new ErrorResponse(`Bootcamp not found with id of ${id}`, 404));

    }
    // This will trigger middleware to cascade delete all courses associated to bootcamp
    bootcamp.remove();

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


