const jwt = require('jsonwebtoken');
const User = require('../model/user');
const userMiddleware = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.SECRET_JWT_KEY);
        const user = await User.findOne({ email: decoded.email.trim() });
        console.log('########',  decoded)
        if(!user)
            return res.status(403).json({
                    success : false,
                    message : 'Unauthorized user'
            })
        
        req.user = user;
        next();
    }catch(err){
        return res.status(500).json({
            success : false,
            message : 'Something went wrong'
        })
    }
}

module.exports = userMiddleware;