// sendgrid key
exports.Sendgrid=process.env.SENDGRID_KEY;

// mongo database
exports.mongo = process.env.MONGO_DATABASE;
exports.port = process.env.PORT

// jwt authentication 
exports.accessToken=process.env.ACCESS_TOKEN_SECRET;
exports.refereshToken=process.env.REFRESH_TOKEN_SECRET;

exports.accessTokenLife=process.env.ACCESS_TOKEN_LIFE;
exports.refereshTokenLife=process.env.REFRESH_TOKEN_LIFE;


//Redis
exports.redisHost = process.env.REDIS_HOST;
exports.redisPassword=process.env.REDIS_PASSWORD;
exports.redisPort=process.env.REDIS_PORT

// google auth
exports.googleAuth = process.env.OAuth2Client;

//stripe payment
exports.stripePayment = process.env.STRIPE_SECRET_TOKEN;

exports.smtp_host = process.env.SMTP_HOST
exports.smtp_port = process.env.SMTP_PORT
exports.smtp_user = process.env.SMTP_USER
exports.smtp_pass = process.env.SMTP_PASS

