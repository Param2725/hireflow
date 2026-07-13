import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { saveOtp, verifyOtp } from "../utils/otpStore.js";
import { sendOtpEmail } from "../config/mailer.js";
import bcrypt from 'bcrypt';

const generateOtp = () => {
    const otpGen = Math.floor(100000 + Math.random() * 90000).toString();
    return otpGen;
};

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email' });
        }

        const otp = generateOtp();
        saveOtp(email, otp);
        await sendOtpEmail(email, otp);

        res.status(200).json({ message: 'OTP sent to your email' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const result = verifyOtp(email, otp);
        if (!result.valid) {
            return res.status(400).json({ message: result.message });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: 'New password cannot be same as old password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await User.findOneAndUpdate({ email }, { password: hashedPassword });

        res.status(200).json({ message: 'Password reset successfully' });

    } catch (error) {
        console.log('Reset error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { id: userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    return {
        accessToken,
        refreshToken
    };
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Create user
        await User.create({ name, email, password, role });

        // Fetch fresh from DB — fixes the undefined fields issue
        const user = await User.findOne({ email });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id);

        // Save refresh token
        await User.findByIdAndUpdate(user._id, { refreshToken });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: 'Registered successfully',
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fetch fresh with all fields
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const { accessToken, refreshToken } = generateTokens(user._id);

        await User.findByIdAndUpdate(user._id, { refreshToken });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: 'Logged in successfully',
            accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401)
                .json(
                    {
                        message: 'No refreshToken'
                    }
                );
        }
        const decodedToken = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decodedToken.id);

        if (!user || user.refreshToken !== token) {
            return res.status(403)
                .json(
                    {
                        message: 'Invalid RefreshToken'
                    }
                )
        };

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);
        user.refreshToken = newRefreshToken;

        await user.save();

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200)
            .json({
                accessToken
            })
    } catch (error) {
        res.status(403)
            .json(
                {
                    message: 'Invalid or Expired RefreshToken'
                }
            )
    }
}

const logoutUser = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (token) {
            await User.findOneAndUpdate(
                {
                    refreshToken: token
                },
                {
                    refreshToken: null
                }
            )
        };

        res.clearCookie('refreshToken');
        res.status(200)
            .json({
                message: 'Logged out SuccessFully'
            });

    } catch (error) {
        res.status(500)
            .json({
                message: error.message
            })
    }
}

export {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    sendOtp,
    resetPassword
}