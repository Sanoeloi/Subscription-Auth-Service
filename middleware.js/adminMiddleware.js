const jwt = require('jsonwebtoken');
const Admin = require('../model/admin');
const adminMiddleware = async (req, res, next) => {
    try{
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.SECRET_JWT_KEY);
        const user = await Admin.findOne({ email: decoded.email });

        if(!user)
            return res.status(403).json({
                    success : false,
                    message : 'Unauthorized user'
            })
        
        req.user = user;
        next();
    }catch(err){
        console.log('ERROR ::: ', err);
        return res.status(500).json({
            success : false,
            message : 'Something went wrong'
        })
    }
}

module.exports = adminMiddleware;