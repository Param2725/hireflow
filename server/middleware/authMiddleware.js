import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401)
                .json({
                    message: 'Not Authorized, no token'
                });
        }

        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decodedToken.id).select('-password -refreshToken');
        if (!req.user) {
            return res.status(401)
                .json({
                    message: 'User no longer Exists'
                })
        }
        next();

    } catch (error) {
        res.status(500)
            .json({
                message: 'Token Invalid or Expired'
            })
    }
}

const isRecruiter = (req, res, next) => {
    if (req.user.role !== 'recruiter') {
        return res.status(403)
            .json({
                message: 'Access Denied : recruiters Only'
            })
    }
    next();
};

const isSeeker = (req, res, next) => {
    if (req.user.role !== 'seeker') {
        return res.status(403)
            .json({
                message: 'Access Denied : seekers Only'
            })
    }
    next();
};

export {
    protect,
    isRecruiter,
    isSeeker
};