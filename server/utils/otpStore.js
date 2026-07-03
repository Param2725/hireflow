const otpStore = new Map();

const saveOtp = (email, otp) => {
    otpStore.set(email, {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 mins
    });
};

const verifyOtp = (email, otp) => {
    const record = otpStore.get(email);

    if (!record) {
        return {
            valid: false, message: 'OTP not found'
        };
    }
    if (Date.now() > record.expiresAt) {
        otpStore.delete(email);
        return {
            valid: false,
            message: 'OTP Expired'
        };
    }
    if (record.otp !== otp) {
        return {
            valid: false,
            message: 'Invalid OTP'
        };
    }
    otpStore.delete(email);
    return {
        valid: true
    };
}

export {
    saveOtp,
    verifyOtp
};